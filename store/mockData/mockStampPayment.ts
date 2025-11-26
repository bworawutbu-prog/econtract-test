export interface PaymentStampDutyProps {
  docId: string;
  docRefId: string;
  docName: string;
  docDetails: string;
  docCounterpartyInfo: {
    name: string;
    address: string;
  };
  docAmount: number;
  docCurrency: string;
  docLocation: string;
  createDate: string;
  startDate: string;
  endDate: string;
}

export const mockData: PaymentStampDutyProps[] = [
  {
    docId: "1",
    docRefId: "1234567890",
    docName: "สมุดบัญชีรายรับรายจ่าย",
    docDetails: "สมุดบัญชีรายรับรายจ่าย",
    docCounterpartyInfo: {
      name: "บริษัท กสิกรชั้นใหญ่ จำกัด",
      address: "4/3 หมู่ 1, ถนน บางนาตราด, กม.16 บางโฉลง,บางพลี, สมุทรปราการ 10540",
    },
    docAmount: 1000000,
    docCurrency: "THB",
    docLocation: "กรุงเทพมหานคร",
    createDate: "2021-01-01",
    startDate: "2021-01-01",
    endDate: "2021-01-01",
  },
  // {
  //   docId: "2",
  //   docRefId: "1234567890",
  //   docName: "สมุดบัญชีรายรับรายจ่าย",
  //   docDetails: "สมุดบัญชีรายรับรายจ่าย",
  //   docCounterpartyInfo: {
  //     name: "บริษัท กสิกรชั้นใหญ่ จำกัด",
  //     address: "4/3 หมู่ 1, ถนน บางนาตราด, กม.16 บางโฉลง,บางพลี, สมุทรปราการ 10540",
  //   },
  //   docAmount: 1000000,
  //   docCurrency: "THB",
  //   docLocation: "กรุงเทพมหานคร",
  //   createDate: "2021-01-01",
  //   startDate: "2021-01-01",
  //   endDate: "2021-01-01",
  // },
  // {
  //   docId: "3",
  //   docRefId: "1234567890",
  //   docName: "สมุดบัญชีรายรับรายจ่าย",
  //   docDetails: "สมุดบัญชีรายรับรายจ่าย",
  //   docCounterpartyInfo: {
  //     name: "บริษัท กสิกรชั้นใหญ่ จำกัด",
  //     address: "4/3 หมู่ 1, ถนน บางนาตราด, กม.16 บางโฉลง,บางพลี, สมุทรปราการ 10540",
  //   },
  //   docAmount: 1000000,
  //   docCurrency: "THB",
  //   docLocation: "กรุงเทพมหานคร",
  //   createDate: "2021-01-01",
  //   startDate: "2021-01-01",
  //   endDate: "2021-01-01",
  // },
];
