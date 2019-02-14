export const formatDate = (date) => {
  const myyear = date.getFullYear();
  let mymonth = date.getMonth() + 1;
  let myweekday = date.getDate();

  if (mymonth < 10) {
    mymonth = `0${mymonth}`;
  }
  if (myweekday < 10) {
    myweekday = `0${myweekday}`;
  }
  return (myyear + mymonth + myweekday);// 想要什么格式都可以随便自己拼
};
