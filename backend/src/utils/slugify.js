export const generateSlug = (text) => {
  return text
    .toString()
    .normalize('NFD') // Tách dấu ra khỏi chữ cái
    .replace(/[\u0300-\u036f]/g, '') // Bỏ các dấu
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/[^\w-]+/g, '') // Xóa các ký tự không phải chữ, số, gạch ngang
    .replace(/--+/g, '-'); // Gộp nhiều dấu gạch ngang thành 1
};
