**_ Hướng dẫn cài đặt _**

- B1: Tải và giải nén tool
- B2: Chạy lệnh: npm install để cài đặt thư viện bổ trợ
- B3: vào thư mục src -> data, nhập query_id vào file users.txt và proxy vào file proxy.txt, không có proxy thì bỏ qua khỏi nhập

**_ Các lệnh chức năng chạy tool _**

- npm run start: dùng để chạy chơi game (dự đoán giá), làm nhiệm vụ,.... tóm lại game có gì là nó làm cái đó
- npm run boost: dùng để nâng cấp các loại boost cho xe đua
  các lệnh trên chạy hoàn toàn độc lập với nhau

🕹️ Các tính năng có trong tool:

- Đa luồng, tự động chạy khi đủ lượt (mặc định sẽ chạy khi còn thiếu 1 lượt để tối ưu, có thể tìm biến numberX = 1 sửa lại theo ý thích)
- Tự động nhận diện proxy
- Tự động làm nhiệm vụ nếu có
- Chơi game dự đoán auto win. Mặc định chế độ auto win bị tắt để tránh ban acc, ai thích thì vào file services/game.js tìm dòng this.autoWin = false đổi false thành true để bật chế độ dự đoán giá auto win
- Nâng cấp boost hàng loạt
- Tự động chuyển đổi định dạng query_id, encode hay decode vứt vô chạy láng hết 🤣
- Mặc định mỗi tài khoản sẽ chạy cách nhau 30s để tránh spam request, có thể tìm biến DELAY_ACC = 30 để điều chỉnh
