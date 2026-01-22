// src/products/products.service.ts 

import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import type { Express } from 'express';
import { safeUnlinkByRelativePath } from '../common/utils/file.utils';

@Injectable()
export class ProductsService {

  // ฟังก์ชันแปลง Path ของไฟล์ให้เป็น Path สำหรับใช้งานผ่าน HTTP
  private toPublicImagePath(filePath: string): string {
    const normalized = filePath.replace(/\\/g, '/'); // ป้องกันปัญหา Windows path
    return normalized.replace(/^\.?\/?uploads\//, '').replace(/^uploads\//, '');
  }

  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) { }

  // --- สร้างสินค้า (Create) --- 
  async create(dto: CreateProductDto, file?: Express.Multer.File): Promise<Product> {
    const diskPath = file?.path?.replace(/\\/g, '/'); // เช่น uploads/products/uuid.jpg
    const imageUrl = diskPath ? this.toPublicImagePath(diskPath) : undefined; // products/uuid.jpg

    try {
      return await this.productModel.create({
        ...dto,
        ...(imageUrl ? { imageUrl } : {}),
      });
    } catch (err) {
      // หากบันทึกลง Database ล้มเหลว ให้ลบไฟล์ที่เพิ่งอัปโหลดทิ้งทันที
      if (diskPath) await safeUnlinkByRelativePath(diskPath); 
      throw new InternalServerErrorException('Create product failed');
    }
  }

  // --- ดึงข้อมูลทั้งหมด (Read All) --- 
  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  // --- ค้นหาสินค้า (Search) --- 
  async search(name?: string, minPrice?: number, maxPrice?: number): Promise<Product[]> {
    const filter: any = {};

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    return this.productModel
      .find(filter)
      .sort({ price: -1 })
      .exec();
  }

  // --- ดึงข้อมูลรายตัว (Read One) --- 
  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  // --- แก้ไขข้อมูล (Update) --- 
  async update(id: string, dto: UpdateProductDto, file?: Express.Multer.File): Promise<Product> {
    // 1. ตรวจสอบก่อนว่ามีสินค้าชิ้นนี้อยู่จริงไหม (จะโยน 404 อัตโนมัติจาก findOne)
    const existingProduct = await this.findOne(id); 

    const diskPath = file?.path?.replace(/\\/g, '/');
    const newImageUrl = diskPath ? this.toPublicImagePath(diskPath) : undefined;

    try {
      const updateData = {
        ...dto,
        ...(newImageUrl ? { imageUrl: newImageUrl } : {}),
      };

      // 2. ทำการอัปเดตข้อมูล
      const updatedProduct = await this.productModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec();

      // --- แก้ไข Error TS2322 ---
      // เช็คว่า updatedProduct ไม่เป็น null เพื่อยืนยันกับ TypeScript
      if (!updatedProduct) {
        throw new NotFoundException(`Product with ID ${id} not found during update`);
      }

      if (newImageUrl && existingProduct.imageUrl) {
        await safeUnlinkByRelativePath(`uploads/${existingProduct.imageUrl}`);
      }

      return updatedProduct;
    } catch (err) {
      // 4. กรณีเกิดข้อผิดพลาดในการอัปเดต ให้ลบรูปใหม่ที่เพิ่งอัปโหลดทิ้ง (Rollback)
      if (diskPath) await safeUnlinkByRelativePath(diskPath);
      
      // ถ้าเป็น NotFoundException ให้ปล่อยผ่านไป แต่ถ้าเป็นอย่างอื่นให้โยน InternalServerError
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Update product failed');
    }
  }

  // --- ลบข้อมูล (Delete) --- 
  async remove(id: string): Promise<Product> {
    // ดึงข้อมูลมาดูก่อนเพื่อเอา imageUrl มาลบไฟล์
    const product = await this.findOne(id);
    
    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();

    if (!deletedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (deletedProduct.imageUrl) {
      await safeUnlinkByRelativePath(`uploads/${deletedProduct.imageUrl}`);
    }

    return deletedProduct;
  }
}