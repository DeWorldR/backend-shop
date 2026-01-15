// src/products/dto/create-product.dto.ts 
import { IsNotEmpty, IsString, IsNumber, Min, IsOptional, IsArray } from 'class-validator'; 

export class CreateProductDto { 
    @IsNotEmpty() 
    @IsString() 
    name: string; 

    @IsNotEmpty() 
    @IsNumber() 
    @Min(0) 
    price: number; 

    @IsOptional() 
    @IsString() 
    description?: string; 

    @IsOptional() 
    @IsArray()   
    @IsString({ each: true })
    colors?: string[]; 
}