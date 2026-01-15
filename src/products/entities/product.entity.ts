// src/products/entities/product.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({
  timestamps: true, // สร้าง createdAt และ updatedAt ให้อัตโนมัติ
})
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0, type: Number, default: 0 })
  price: number;

  @Prop()
  description: string;

  // เก็บข้อมูลสีเป็น Array ของ String
  @Prop({ type: [String], default: [] })
  colors: string[];

  @Prop() // เก็บเป็น String (Path ของไฟล์) เช่น 'uploads/xxx-xxx.jpg' 
  imageUrl: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
