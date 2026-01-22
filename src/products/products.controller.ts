import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator } from '@nestjs/common'; // เพิ่ม Query
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { PRODUCT_IMAGE } from './products.constants';


@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }


  @Get('search')
  async search(
    @Query('name') name: string,
    @Query('min') min: string,
    @Query('max') max: string,
  ) {
    return this.productsService.search(
      name,
      min ? parseFloat(min) : undefined,
      max ? parseFloat(max) : undefined
    );
  }

  @Post()
  @UseInterceptors(FileInterceptor('image')) // ชื่อฟิลด์ที่รับไฟล์จาก form-data “image” 
  create(
    @Body() dto: CreateProductDto,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: false, validators: [new MaxFileSizeValidator({ maxSize: PRODUCT_IMAGE.MAX_SIZE })], }),)
    file?: Express.Multer.File,) {
    return this.productsService.create(dto, file);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productsService.update(id, updateProductDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }



}
