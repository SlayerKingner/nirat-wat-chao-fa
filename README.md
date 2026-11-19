# นิราศวัดเจ้าฟ้า — Interactive Scrollytelling

เว็บเล่าเรื่องแบบเลื่อนจอจากนิราศวัดเจ้าฟ้า (สุนทรภู่) แนวเดียวกับ interactive graphic novel
ภาพประกอบเป็น SVG และเสียงสร้างด้วย Web Audio ทั้งหมด ไม่มีไฟล์ภาพหรือเสียงภายนอก

## โครงสร้างไฟล์
| ไฟล์ | หน้าที่ |
|---|---|
| `index.html` | โครงหน้า |
| `style.css` | หน้าตา / แอนิเมชัน |
| `content.js` | **เนื้อหาทั้งหมด** (บท, บรรยาย, กลอน, เสียงประจำบท) ← แก้ไฟล์นี้ไฟล์เดียว |
| `app.js` | เอนจิน: ฉาก SVG, เสียง, มินิเกม, ระบบเลื่อน |

## แก้เนื้อหา
เปิด `content.js` แต่ละบทมี `beats` เป็นการ์ดที่เลื่อนผ่าน
- `{ t:'narr', h:'หัวข้อ', p:'ข้อความ' }` บรรยาย
- `{ t:'verse', lines:[['วรรคหน้า','วรรคหลัง']], src:'ที่มา' }` กลอน
- `{ t:'game', game:'fireflies'|'mercury'|'candle' }` มินิเกม
- `{ t:'fx', fx:'buffalo' }`, `{ t:'map' }` ฉากพิเศษ
- ใส่ `fx:'gong'|'thunder'|'splash'|'ghost'` ในการ์ดไหนก็ได้ เพื่อให้มีเสียงตอนการ์ดโผล่

ฉากที่ใช้ได้ (`art`): depart, rakhang, river, fireflies, charnel, watyai, field, legend, ritual, return

## ทดสอบบน Mac
ดับเบิลคลิก `index.html` ได้เลย หรือเปิด Terminal ในโฟลเดอร์แล้วรัน
```
python3 -m http.server 8000
```
แล้วเข้า http://localhost:8000

## ขึ้น GitHub Pages
1. สร้าง repo ใหม่บน GitHub เช่น `nirat-wat-chao-fa` (Public)
2. อัปโหลดไฟล์ทั้ง 4 ไฟล์ไว้ที่ราก repo (Add file → Upload files)
3. Settings → Pages → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save
4. รอ 1–2 นาที เว็บจะอยู่ที่ `https://<ชื่อผู้ใช้>.github.io/nirat-wat-chao-fa/`

หรือใช้ Terminal:
```
git init && git add . && git commit -m "first build"
git branch -M main
git remote add origin https://github.com/<ชื่อผู้ใช้>/nirat-wat-chao-fa.git
git push -u origin main
```
