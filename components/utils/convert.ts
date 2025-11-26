const formatNumber = (number: number | string) => {
  if (!number || number === "" || number === null || number === undefined)
    return "0";
  const formatter = new Intl.NumberFormat("en-US");
  return formatter.format(Number(number));
};

const convertFormatDate = (date: string) => {
  const dateObj = new Date(date).toLocaleString("en-US", {
    timeZone: "Asia/Bangkok",
  });
  if (dateObj.includes("Invalid Date")) {
    return "";
  }
  let [month, day, year] = dateObj.split(", ")[0].split("/");
  let [hours, minutes, seconds] = dateObj.split(" ")[1].split(":");
  return `${day}/${month}/${year}`;
};
export { formatNumber, convertFormatDate };
