# Shop — Backend API

REST API จัดการสินค้าของร้านค้าออนไลน์ ทำงานคู่กับหน้าเว็บ [frontend](https://github.com/DeWorldR/frontend)

**Tech:** NestJS · TypeScript · MongoDB (Mongoose) · Multer · class-validator

## ฟีเจอร์
- เพิ่ม ดู แก้ไข ลบสินค้า (CRUD) และค้นหาสินค้า
- อัปโหลดรูปสินค้าด้วย Multer และเปิดให้ดูรูปผ่าน static route
- ตรวจข้อมูลที่ส่งเข้ามาด้วย DTO และ class-validator

## API
| Method | Path | ใช้ทำอะไร |
|---|---|---|
| GET | `/products` | รายการสินค้า |
| GET | `/products/search` | ค้นหาสินค้า |
| GET | `/products/:id` | ดูสินค้า |
| POST | `/products` | เพิ่มสินค้า (multipart พร้อมรูป) |
| PATCH | `/products/:id` | แก้ไขสินค้า |
| DELETE | `/products/:id` | ลบสินค้า |

## รันในเครื่อง
```bash
npm install
echo "MONGO_URI=mongodb://localhost:27017/shop" > .env
npm run start:dev   # http://localhost:3000
```
