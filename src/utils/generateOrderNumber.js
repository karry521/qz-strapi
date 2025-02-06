const generateOrderNumber = (length = 5) => {
  const now = new Date();

  // 获取年月日
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hour = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  let num = "";
  // N位随机数(加在时间戳后面)
  for (let i = 0; i < length; i++) {
    num += Math.floor(Math.random() * 10);
  }

  // 毫秒数随机
  const milliseconds = now.getMilliseconds().toString();

  return year + month + day + hour + minutes + seconds + milliseconds + num;
};

module.exports = generateOrderNumber;
