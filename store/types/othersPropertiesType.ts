  export interface PropertyTypeList {
    type: string;
    detail: detailType[];
  }
  
  export interface detailType {
    label: string
    value: string
    type?: string
    required?: boolean
    detail?: detailType[]
    selectOptions?: SelectOption[]
    radioOptions?: RadioOption[]
}

export interface SelectOption {
    label: string
    value: string
    type?: string
}

export interface RadioOption {
    label: string
    value: string
    type?: string
}

export const propertyTypeList : PropertyTypeList[] = [
    {
        type: "1",
        detail: [
            {
                label: "ทรัพย์สินที่เช่า",
                value: "1",
                type: "checkbox",
                required: true,
                detail: [
                    {
                        label: "ที่ดิน",
                        value: "1",
                        detail: [
                            {
                                label: "ประเภทเอกสารสิทธ์",
                                value: "1",
                                type: "select",
                                required: true,
                                selectOptions: [
                                    {
                                        label: "โฉนดที่ดิน",
                                        value: "1",
                                    },
                                    {
                                        label: "น.ส 3",
                                        value: "2",
                                    },
                                    {
                                        label: "น.ส 3ก",
                                        value: "3",
                                    },
                                    {
                                        label: "น.ส 3ข",
                                        value: "4",
                                    },
                                    {
                                        label: "น.ส 3ค",
                                        value: "5",
                                    },
                                    {
                                        label: "เอกสารสิทธิ์อื่นๆ",
                                        value: "6",
                                        type: "other",
                                    }
                                ],
                            },
                            {
                                label: "เลขที่",
                                value: "2",
                                type: "text",
                                required: true,
                            },
                            {
                                label: "เลขที่ดิน",
                                value: "3",
                                type: "text",
                                required: true,
                            },
                            {
                                label: "ที่อยู่",
                                value: "4",
                                type: "text",
                                required: true,
                            }
                        ]
                    },
                    {
                        label: "โรงเรือน",
                        value: "2",
                        detail: [
                            {
                                label: "ประเภทของโรงเรือน",
                                value: "1",
                                type: "select",
                                required: true,
                                selectOptions: [
                                    {
                                        label: "อาคารที่อยู่อาศัย",
                                        value: "1",
                                    },
                                    {
                                        label: "อาคารพาณิชย์",
                                        value: "2",
                                    },
                                    {
                                        label: "ทาวน์เฮ้าส์",
                                        value: "3",
                                    },
                                    {
                                        label: "ห้องชุด",
                                        value: "4",
                                    },
                                    {
                                        label: "อาคารสำนักงาน",
                                        value: "5",
                                    },
                                    {
                                        label: "อื่นๆ",
                                        value: "6",
                                        type: "other",
                                    }
                                ],
                            },
                            {
                                label: "โรงเรือนเลขที่",
                                value: "2",
                                type: "text",
                                required: true,
                            },
                            {
                                label: "ที่อยู่",
                                value: "3",
                                type: "text",
                                required: true,
                            }
                        ]
                    },
                    {
                        label: "สิ่งปลูกสร้างอื่น",
                        value: "3",
                        detail: [
                            {
                                label: "ชื่อสิ่งปลูกสร้างอื่น",
                                value: "1",
                                type: "text",
                                required: true,
                            },
                            {
                                label: "สิ่งปลูกสร้างเลขที่",
                                value: "2",
                                type: "text",
                                required: true,
                            },
                            {
                                label: "ที่อยู่",
                                value: "3",
                                type: "text",
                                required: true,
                            }
                        ]
                    },
                    {
                        label: "แพ",
                        value: "4",
                        detail: [
                            {
                                label: "แพเลขที่",
                                value: "1",
                                type: "text",
                                required: true,
                            },
                            {
                                label: "ที่อยู่",
                                value: "2",
                                type: "text",
                                required: true,
                            }
                        ]
                    },
                ]
            },
            {
                label: "ค่าเช่า หรือประมาณการค่าเช่า",
                value: "2",
                type: "checkbox",
                required: true,
                detail: [
                    {
                        label: "ชำระค่าเช่าเป็นรายเดือน",
                        value: "1",
                        detail: [
                            {
                                label: "จำนวนเดือน",
                                value: "1",
                                type: "number",
                                required: true,
                            },
                            {
                                label: "ค่าเช่าเดือนละ",
                                value: "2",
                                type: "number",
                                required: true,
                            },
                            {
                                label: "เงินกินเปล่า",
                                value: "3",
                                type: "number",
                            },
                            {
                                label: "รวมเป็นเงิน",
                                value: "4",
                                type: "number",
                            },
                        ]
                    },
                    {
                        label: "ชำระค่าเช่าเป็นรายปี",
                        value: "2",
                        detail: [
                            {
                                label: "จำนวนปี",
                                value: "1",
                                type: "number",
                                required: true,
                            },
                            {
                                label: "ค่าเช่าปีละ",
                                value: "2",
                                type: "number",
                                required: true,
                            },
                            {
                                label: "เงินกินเปล่า",
                                value: "3",
                                type: "number",
                            },
                            {
                                label: "รวมเป็นเงิน",
                                value: "4",
                                type: "number",
                            },
                        ]
                    },
                    {
                        label: "ค่าเช่าผันแปร",
                        value: "3",
                        detail: [
                            {
                                label: "รายละเอียดการประมาณการ",
                                value: "1",
                                type: "text",
                            },
                            {
                                label: "ประมาณการค่าเช่าผันแปร",
                                value: "2",
                                type: "number",
                                required: true,
                            },
                            {
                                label: "เงินกินเปล่า",
                                value: "3",
                                type: "number",
                            },
                            {
                                label: "รวมเป็นเงิน",
                                value: "4",
                                type: "number",
                            },
                        ]
                    },
                    {
                        label: "ค่าเช่าตลอดอายุสัญญาเช่า",
                        value: "4",
                        detail: [
                            {
                                label: "ค่าเช่าตลอดอายุสัญญาเช่า",
                                value: "1",
                                type: "number",
                                required: true,
                            },
                            {
                                label: "เงินกินเปล่า",
                                value: "2",
                                type: "number",
                            },
                            {
                                label: "รวมเป็นเงิน",
                                value: "3",
                                type: "number",
                            },
                        ]
                    },
                ]
            },
        ]
    }, 
    {
        type: "3",
        detail: [
            {
                label: "ประเภททรัพสินที่เช่าซื้อ",
                value: "1",
                type: "select",
                required: true,
                selectOptions: [
                    {
                        label: "อสังหาริมทรัพย์",
                        value: "1",
                    },
                    {
                        label: "สังหาริมทรัพย์",
                        value: "2",
                    },
                ],
                detail: [
                    {
                        label: "อสังหาริมทรัพย์",
                        value: "1",
                        type: "checkbox",
                        required: true,
                        detail: [
                            {
                                label: "ที่ดิน",
                                value: "1",
                                detail: [
                                    {
                                        label: "ประเภทเอกสารสิทธ์",
                                        value: "1",
                                        type: "select",
                                        required: true,
                                        selectOptions: [
                                            {
                                                label: "โฉนดที่ดิน",
                                                value: "1",
                                            },
                                            {
                                                label: "น.ส 3",
                                                value: "2",
                                            },
                                            {
                                                label: "น.ส 3ก",
                                                value: "3",
                                            },
                                            {
                                                label: "น.ส 3ข",
                                                value: "4",
                                            },
                                            {
                                                label: "น.ส 3ค",
                                                value: "5",
                                            },
                                            {
                                                label: "เอกสารสิทธิ์อื่นๆ",
                                                value: "6",
                                                type: "other",
                                            }
                                        ],
                                    },
                                    {
                                        label: "เลขที่",
                                        value: "2",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "เลขที่ดิน",
                                        value: "3",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "ที่อยู่",
                                        value: "4",
                                        type: "text",
                                        required: true,
                                    }
                                ]
                            },
                            {
                                label: "โรงเรือน",
                                value: "2",
                                detail: [
                                    {
                                        label: "ประเภทของโรงเรือน",
                                        value: "1",
                                        type: "select",
                                        required: true,
                                        selectOptions: [
                                            {
                                                label: "อาคารที่อยู่อาศัย",
                                                value: "1",
                                            },
                                            {
                                                label: "อาคารพาณิชย์",
                                                value: "2",
                                            },
                                            {
                                                label: "ทาวน์เฮ้าส์",
                                                value: "3",
                                            },
                                            {
                                                label: "ห้องชุด",
                                                value: "4",
                                            },
                                            {
                                                label: "อาคารสำนักงาน",
                                                value: "5",
                                            },
                                            {
                                                label: "อื่นๆ",
                                                value: "6",
                                                type: "other",
                                            }
                                        ],
                                    },
                                    {
                                        label: "โรงเรือนเลขที่",
                                        value: "2",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "ที่อยู่",
                                        value: "3",
                                        type: "text",
                                        required: true,
                                    }
                                ]
                            },
                            {
                                label: "สิ่งปลูกสร้างอื่น",
                                value: "3",
                                detail: [
                                    {
                                        label: "ชื่อสิ่งปลูกสร้างอื่น",
                                        value: "1",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "สิ่งปลูกสร้างเลขที่",
                                        value: "2",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "ที่อยู่",
                                        value: "3",
                                        type: "text",
                                        required: true,
                                    }
                                ]
                            },
                        ]
                    },
                    {
                        label: "สังหาริมทรัพย์",
                        value: "2",
                        detail: [
                            {
                                label: "รถยนต์ใหม่",
                                value: "1",
                                detail: [
                                    {
                                        label: "ยี่ห้อ",
                                        value: "1",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "รุ่น",
                                        value: "2",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "เลขทะเบียน",
                                        value: "3",
                                        type: "text",
                                    },
                                    {
                                        label: "เลขเครื่องยนต์",
                                        value: "4",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "เลขตัวรถ",
                                        value: "5",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "สี",
                                        value: "6",
                                        type: "text",
                                        required: true,
                                    }
                                ]
                            },
                            {
                                label: "รถยนต์เก่า",
                                value: "2",
                                detail: [
                                    {
                                        label: "ยี่ห้อ",
                                        value: "1",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "รุ่น",
                                        value: "2",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "เลขทะเบียน",
                                        value: "3",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "เลขเครื่องยนต์",
                                        value: "4",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "เลขตัวรถ",
                                        value: "5",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "สี",
                                        value: "6",
                                        type: "text",
                                        required: true,
                                    }
                                ]
                            },
                            {
                                label: "รถจักรยานยนต์ใหม่",
                                value: "3",
                                detail: [
                                    {
                                        label: "ยี่ห้อ",
                                        value: "1",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "รุ่น",
                                        value: "2",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "เลขทะเบียน",
                                        value: "3",
                                        type: "text",
                                    },
                                    {
                                        label: "เลขเครื่องยนต์",
                                        value: "4",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "เลขตัวรถ",
                                        value: "5",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "สี",
                                        value: "6",
                                        type: "text",
                                        required: true,
                                    }
                                ]
                            },
                            {
                                label: "รถจักรยานยนต์เก่า",
                                value: "4",
                                detail: [
                                    {
                                        label: "ยี่ห้อ",
                                        value: "1",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "รุ่น",
                                        value: "2",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "เลขทะเบียน",
                                        value: "3",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "เลขเครื่องยนต์",
                                        value: "4",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "เลขตัวรถ",
                                        value: "5",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "สี",
                                        value: "6",
                                        type: "text",
                                        required: true,
                                    }
                                ]
                            },
                            {
                                label: "อื่นๆ",
                                value: "5",
                                detail: [
                                    {
                                        label: "ชื่อประเภทสังหาริมทรัพย์อื่นๆ",
                                        value: "1",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "ประเภททรัพย์สิน",
                                        value: "2",
                                        type: "text",
                                        required: true,
                                    },
                                    {
                                        label: "ยี่ห้อ",
                                        value: "3",
                                        type: "text",
                                    },
                                    {
                                        label: "รุ่น",
                                        value: "4",
                                        type: "text",
                                    },
                                    {
                                        label: "เลขทะเบียน/Serialnumber",
                                        value: "5",
                                        type: "text",
                                    },
                                    {
                                        label: "อื่นๆ",
                                        value: "6",
                                        type: "text",
                                    },
                                ]
                            },
                        ]
                    },
                ]
            },
            {
                label: "ราคาทรัพย์สินที่เช่าซื้อ",
                value: "2",
                detail: [
                    {
                        label: "ราคาทุนทรัพย์/ราคาเงินสด (รวมเงินชำระล่วงหน้า แต่ไม่รวมภาษีมูลค่าเพิ่ม)",
                        value: "1",
                        type: "number",
                        required: true,
                    },
                    {
                        label: "ดอกผลตามสัญญาเช่าซื้อ (ไม่รวมภาษีมูลค่าเพิ่ม) ",
                        value: "2",
                        type: "number",
                        required: true,
                    },
                    {
                        label: "ค่างวดเช่าซื้อ (รวมภาษีมูลค่าเพิ่ม)",
                        value: "3",
                        type: "number",
                        required: true,
                    },
                    {
                        label: "จำนวนงวด",
                        value: "4",
                        type: "number",
                        required: true,
                    },
                    {
                        label: "มูลค่าในตราสาร (มูลค่าสัญญา ไม่รวมภาษีมูลค่าเพิ่ม)",
                        value: "5",
                        type: "number",
                    },
                ]
            }
        ]
    },
    {
        type: "4",
        detail: [
            {
                label: "งานที่รับจ้าง",
                value: "1",
                type: "text",
                required: true,
            },
            {
                label: "จำนวนงวด",
                value: "2",
                type: "number",
                required: true,
            },
            {
                label: "มูลค่าในตราสาร (มูลค่าสัญญา ไม่รวมภาษีมูลค่าเพิ่ม)",
                value: "3",
                type: "number",
                required: true,
            },
            {
                label: "จำนวนเงินค้ำประกันตามสัญญา",
                value: "4",
                type: "number",
            },
        ]
    },
    {
        type: "7",
        detail: [
            {
                label: "รายละเอียดการมอบอำนาจ",
                value: "1",
                required: true,
                type: "text",
            },
            {
                label: "เงื่อนไขการมอบอำนาจ",
                value: "2",
                required: true,
                type: "select",
                selectOptions: [
                    {
                        label: "มอบอำนาจให้บุคคลคนเดียวหรือหลายคนกระทำการครั้งเดียว",
                        value: "1",
                    },
                    {
                        label: "มอบอำนาจให้บุคคลคนเดียวหรือหลายคนร่วมกระทำการ มากกว่าครั้งเดียว",
                        value: "2",
                    },
                    {
                        label: "มอบอำนาจให้กระทำการมากกว่าครั้งเดียวโดยบุคคลหลายคนต่างคนต่างกระทำกิจการแยกกันได้",
                        value: "3",
                    },
                ],
            },
        ]
    },
    {
        type: "17",
        detail: [
            {
                label: "จำนวนเงินค้ำประกัน",
                value: "2",
                type: "number",
                required: true, //ถ้าเงื่อนไขการค้ำประกันเป็น กรณีที่มิได้จำกัดจำนวนเงินไว้ ไม่จำเป็นต้องกรอก
            },
            {
                label: "เงื่อนไขการค้ำประกัน",
                value: "1",
                type: "select",
                required: true,
                selectOptions: [
                    {
                        label: "กรณีที่มิได้จำกัดจำนวนเงินไว้",
                        value: "1",
                    },
                    {
                        label: "จำนวนเงินไม่เกิน 1,000 บาท",
                        value: "2",
                    },
                    {
                        label: "จำนวนเงินเกิน 1,000 บาท แต่ไม่เกิน 10,000 บาท",
                        value: "3",
                    },
                    {
                        label: "จำนวนเงินเกิน 10,000 บาท ขึ้นไป",
                        value: "4",
                    },
                ],
            },
            {
                label: "เลขประจำตัวผู้เสียภาษีอากรของเจ้าหนี้/ผู้ว่าจ้าง",
                value: "3",
                type: "text",
            },
            {
                label: "ชื่อเจ้าหนี้/ผู้ว่าจ้าง",
                value: "4",
                type: "text",
                required: true,
            },
        ]
    },
    {
        type: "28",
        detail: [
            {
                label: "ประเภทยานพาหนะ",
                value: "1",
                type: "text",
                required: true,
            },
            {
                label: "จำนวนยานพาหนะ",
                value: "2",
                type: "number",
                required: true,
            },
            {
                label: "หน่วยของยานพาหนะ",
                value: "3",
                type: "radio",
                required: true,
                radioOptions: [
                    {
                        label: "คัน",
                        value: "1",
                    },
                    {
                        label: "ลำ",
                        value: "2",
                    },
                    {
                        label: "อื่นๆ",
                        value: "3",
                        type: "other",
                    },
                ],
            },
            {
                label: "จำนวนเงินที่ได้รับชำระ",
                value: "4",
                type: "number",
                required: true,
            }
        ]
    },
  ]

  export const RentPropertyTypeList1 = [
    {
        label: "ที่ดิน",
        value: "1",
    },
    {
        label: "โรงเรือน",
        value: "2",
    },
    {
        label: "สิ่งปลูกสร้างอื่น",
        value: "3",
    },
    {
        label: "แพ",
        value: "4",
    },
]

export const RentPropertyTypeList3 = [
    {
        label: "ที่ดิน",
        value: "1",
    },
    {
        label: "โรงเรือน",
        value: "2",
    },
    {
        label: "สิ่งปลูกสร้างอื่น",
        value: "3",
    },
]

export const landPropertyTypeList = [
    {
        label: "โฉนดที่ดิน",
        value: "1",
    },
    {
        label: "น.ส 3",
        value: "2",
    },
    {
        label: "น.ส 3ก",
        value: "3",
    },
    {
        label: "น.ส 3ข",
        value: "4",
    },
    {
        label: "น.ส 3ค",
        value: "5",
    },
    {
        label: "เอกสารสิทธิ์อื่นๆ",
        value: "6",
        type: "other",
    }
]

export const conditionForPowerOfAttorneyList = [
    {
        label: "มอบอำนาจให้บุคคลคนเดียวหรือหลายคนกระทำการครั้งเดียว",
        value: "1",
    },
    {
        label: "มอบอำนาจให้บุคคลคนเดียวหรือหลายคนร่วมกระทำการ มากกว่าครั้งเดียว",
        value: "2",
    },
    {
        label: "มอบอำนาจให้กระทำการมากกว่าครั้งเดียวโดยบุคคลหลายคนต่างคนต่างกระทำกิจการแยกกันได้",
        value: "3",
    },
]

export const conditionForSecurityList = [
    {
        label: "กรณีที่มิได้จำกัดจำนวนเงินไว้",
        value: "1",
    },
    {
        label: "จำนวนเงินไม่เกิน 1,000 บาท",
        value: "2",
    },
    {
        label: "จำนวนเงินเกิน 1,000 บาท แต่ไม่เกิน 10,000 บาท",
        value: "3",
    },
    {
        label: "จำนวนเงินเกิน 10,000 บาท ขึ้นไป",
        value: "4",
    },
]

export const movablePropertyTypeList = [
    {
        label: "รถยนต์ใหม่",
        value: "1",
    },
    {
        label: "รถยนต์เก่า",
        value: "2",
    },
    {
        label: "รถจักรยานยนต์ใหม่",
        value: "3",
    },
    {
        label: "รถจักรยานยนต์เก่า",
        value: "4",
    },
    {
        label: "อื่นๆ",
        value: "5",
        type: "other",
    },
]

export const buildingPropertyTypeList = [
    {
        label: "อาคารที่อยู่อาศัย",
        value: "1",
    },
    {
        label: "อาคารพาณิชย์",
        value: "2",
    },
    {
        label: "ทาวน์เฮ้าส์",
        value: "3",
    },
    {
        label: "ห้องชุด",
        value: "4",
    },
    {
        label: "อาคารสำนักงาน",
        value: "5",
    },
    {
        label: "อื่นๆ",
        value: "6",
        type: "other",
    }
]

export const rentalEstimatePropertyTypeList = [
    {
        label: "ชำระค่าเช่าเป็นรายเดือน",
        value: "1",
    },
    {
        label: "ชำระค่าเช่าเป็นรายปี",
        value: "2",
    },
    {
        label: "ค่าเช่าผันแปร",
        value: "3",
    },
    {
        label: "ค่าเช่าตลอดอายุสัญญาเช่า",
        value: "4",
    },
]

export const titleLegalEntityList = [
    {
      titleCode: "5211",
      titleNameTh: "บริษัท",
      titleName: "บริษัท",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "5212",
      titleNameTh: "บริษัทเงินทุน",
      titleName: "บริษัทเงินทุน",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "5213",
      titleNameTh: "บริษัทหลักทรัพย์",
      titleName: "บริษัทหลักทรัพย์",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "5214",
      titleNameTh: "บริษัทเงินทุนหลักทรัพย์",
      titleName: "บริษัทเงินทุนหลักทรัพย์",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "5215",
      titleNameTh: "บริษัทมหาชนจำกัด",
      titleName: "บริษัทมหาชนจำกัด",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "5216",
      titleNameTh: "บริษัทจัดหางาน",
      titleName: "บริษัทจัดหางาน",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "5217",
      titleNameTh: "บรรษัท",
      titleName: "บรรษัท",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "5218",
      titleNameTh: "บริษัทขนส่งระหว่างประเทศ",
      titleName: "บริษัทขนส่งระหว่างประเทศ",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "5222",
      titleNameTh: "ห้างหุ้นส่วนจำกัด",
      titleName: "ห้างหุ้นส่วนจำกัด",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "5223",
      titleNameTh: "ห้างหุ้นส่วนสามัญ",
      titleName: "ห้างหุ้นส่วนสามัญ",
      titleNameEn: null,
      titleGroup: "4",
      status: "A"
    },
    {
      titleCode: "5224",
      titleNameTh: "ห้างหุ้นส่วนสามัญนิติบุคคล",
      titleName: "ห้างหุ้นส่วนสามัญนิติบุคคล",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "5231",
      titleNameTh: "กิจการร่วมค้า",
      titleName: "กิจการร่วมค้า",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "5110",
      titleNameTh: "คณะบุคคล",
      titleName: "คณะบุคคล",
      titleNameEn: null,
      titleGroup: "4",
      status: "A"
    },
    {
      titleCode: "5111",
      titleNameTh: "คณะบุคคลโดย",
      titleName: "คณะบุคคลโดย",
      titleNameEn: null,
      titleGroup: "4",
      status: "A"
    },
    {
      titleCode: "5112",
      titleNameTh: "คณะบุคคลโดยนาย",
      titleName: "คณะบุคคลโดยนาย",
      titleNameEn: null,
      titleGroup: "4",
      status: "A"
    },
    {
      titleCode: "5113",
      titleNameTh: "คณะบุคคลโดยนาง",
      titleName: "คณะบุคคลโดยนาง",
      titleNameEn: null,
      titleGroup: "4",
      status: "A"
    },
    {
      titleCode: "5114",
      titleNameTh: "คณะบุคคลโดยน.ส.",
      titleName: "คณะบุคคลโดยน.ส.",
      titleNameEn: null,
      titleGroup: "4",
      status: "A"
    },
    {
      titleCode: "5115",
      titleNameTh: "คณะบุคคลโดยด.ช.",
      titleName: "คณะบุคคลโดยด.ช.",
      titleNameEn: null,
      titleGroup: "4",
      status: "A"
    },
    {
      titleCode: "5116",
      titleNameTh: "คณะบุคคลโดยด.ญ.",
      titleName: "คณะบุคคลโดยด.ญ.",
      titleNameEn: null,
      titleGroup: "4",
      status: "A"
    },
    {
      titleCode: "5232",
      titleNameTh: "มูลนิธิ",
      titleName: "มูลนิธิ",
      titleNameEn: null,
      titleGroup: "7",
      status: "A"
    },
    {
      titleCode: "5233",
      titleNameTh: "สมาคม",
      titleName: "สมาคม",
      titleNameEn: null,
      titleGroup: "7",
      status: "A"
    },
    {
      titleCode: "5234",
      titleNameTh: "สำนักงานผู้แทน",
      titleName: "สำนักงานผู้แทน",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "5235",
      titleNameTh: "นิติบุคคลอาคารชุด",
      titleName: "นิติบุคคลอาคารชุด",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "5236",
      titleNameTh: "สำนักงานผู้แทนภูมิภาค",
      titleName: "สำนักงานผู้แทนภูมิภาค",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "5237",
      titleNameTh: "สำนักงานภูมิภาค",
      titleName: "สำนักงานภูมิภาค",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "5238",
      titleNameTh: "พรรค",
      titleName: "พรรค",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "5239",
      titleNameTh: "นิติบุคคลหมู่บ้าน",
      titleName: "นิติบุคคลหมู่บ้าน",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "5240",
      titleNameTh: "ธนาคาร",
      titleName: "ธนาคาร",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "5241",
      titleNameTh: "หอการค้า",
      titleName: "หอการค้า",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "5242",
      titleNameTh: "สมาคมหอการค้า",
      titleName: "สมาคมหอการค้า",
      titleNameEn: null,
      titleGroup: "6,8",
      status: "A"
    },
    {
      titleCode: "5243",
      titleNameTh: "สมาคมการค้า",
      titleName: "สมาคมการค้า",
      titleNameEn: null,
      titleGroup: "7",
      status: "A"
    },
    {
      titleCode: "6110",
      titleNameTh: "คลีนิค",
      titleName: "คลีนิค",
      titleNameEn: null,
      titleGroup: "4,5,6",
      status: "A"
    },
    {
      titleCode: "6120",
      titleNameTh: "ภัตตาคาร",
      titleName: "ภัตตาคาร",
      titleNameEn: null,
      titleGroup: "4,5,6",
      status: "A"
    },
    {
      titleCode: "6130",
      titleNameTh: "ร้าน",
      titleName: "ร้าน",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "6140",
      titleNameTh: "โรงงาน",
      titleName: "โรงงาน",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "6150",
      titleNameTh: "โรงพยาบาล",
      titleName: "โรงพยาบาล",
      titleNameEn: null,
      titleGroup: "6,8",
      status: "A"
    },
    {
      titleCode: "6151",
      titleNameTh: "โรงพยาบาลส่งเสริมสุขภาพตำบล",
      titleName: "โรงพยาบาลส่งเสริมสุขภาพตำบล",
      titleNameEn: null,
      titleGroup: "6,8",
      status: "A"
    },
    {
      titleCode: "6152",
      titleNameTh: "สถานีอนามัย",
      titleName: "สถานีอนามัย",
      titleNameEn: null,
      titleGroup: "6,8",
      status: "A"
    },
    {
      titleCode: "6160",
      titleNameTh: "โรงพยาบาลสัตว์",
      titleName: "โรงพยาบาลสัตว์",
      titleNameEn: null,
      titleGroup: "6,8",
      status: "A"
    },
    {
      titleCode: "6170",
      titleNameTh: "โรงพิมพ์",
      titleName: "โรงพิมพ์",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "6180",
      titleNameTh: "โรงไฟฟ้า",
      titleName: "โรงไฟฟ้า",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "6190",
      titleNameTh: "โรงภาพยนตร์",
      titleName: "โรงภาพยนตร์",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "6200",
      titleNameTh: "โรงรับจำนำ",
      titleName: "โรงรับจำนำ",
      titleNameEn: null,
      titleGroup: "4,5,6",
      status: "A"
    },
    {
      titleCode: "6210",
      titleNameTh: "โรงแรม",
      titleName: "โรงแรม",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "6220",
      titleNameTh: "โรงเลื่อย",
      titleName: "โรงเลื่อย",
      titleNameEn: null,
      titleGroup: "4,5,6",
      status: "A"
    },
    {
      titleCode: "6230",
      titleNameTh: "โรงเลื่อยจักร",
      titleName: "โรงเลื่อยจักร",
      titleNameEn: null,
      titleGroup: "4,5,6",
      status: "A"
    },
    {
      titleCode: "6240",
      titleNameTh: "โรงสี",
      titleName: "โรงสี",
      titleNameEn: null,
      titleGroup: "4,5,6",
      status: "A"
    },
    {
      titleCode: "6250",
      titleNameTh: "วงดนตรี",
      titleName: "วงดนตรี",
      titleNameEn: null,
      titleGroup: "4,5,6",
      status: "A"
    },
    {
      titleCode: "6260",
      titleNameTh: "สถานพยาบาล",
      titleName: "สถานพยาบาล",
      titleNameEn: null,
      titleGroup: "4,5,6,8",
      status: "A"
    },
    {
      titleCode: "6270",
      titleNameTh: "สำนักงาน",
      titleName: "สำนักงาน",
      titleNameEn: null,
      titleGroup: "4,5,6",
      status: "A"
    },
    {
      titleCode: "6280",
      titleNameTh: "ห้างขายทอง",
      titleName: "ห้างขายทอง",
      titleNameEn: null,
      titleGroup: "4,5,6",
      status: "A"
    },
    {
      titleCode: "6290",
      titleNameTh: "ห้างขายยา",
      titleName: "ห้างขายยา",
      titleNameEn: null,
      titleGroup: "4,5,6",
      status: "A"
    },
    {
      titleCode: "6300",
      titleNameTh: "ห้องเสริมสวย",
      titleName: "ห้องเสริมสวย",
      titleNameEn: null,
      titleGroup: "4,5,6",
      status: "A"
    },
    {
      titleCode: "6310",
      titleNameTh: "ห้องอาหาร",
      titleName: "ห้องอาหาร",
      titleNameEn: null,
      titleGroup: "4,5,6",
      status: "A"
    },
    {
      titleCode: "6320",
      titleNameTh: "สำนัก",
      titleName: "สำนัก",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7110",
      titleNameTh: "กอง",
      titleName: "กอง",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7112",
      titleNameTh: "กองทุน",
      titleName: "กองทุน",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "7113",
      titleNameTh: "กองทุนเปิด",
      titleName: "กองทุนเปิด",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "7114",
      titleNameTh: "กองทุนปิด",
      titleName: "กองทุนปิด",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "7115",
      titleNameTh: "กองทุนรวม",
      titleName: "กองทุนรวม",
      titleNameEn: null,
      titleGroup: "6",
      status: "A"
    },
    {
      titleCode: "7116",
      titleNameTh: "กองทุนหมู่บ้าน",
      titleName: "กองทุนหมู่บ้าน",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7120",
      titleNameTh: "กองทุนสำรองเลี้ยงชีพ",
      titleName: "กองทุนสำรองเลี้ยงชีพ",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7130",
      titleNameTh: "คณะ",
      titleName: "คณะ",
      titleNameEn: null,
      titleGroup: "4,5,8",
      status: "A"
    },
    {
      titleCode: "7140",
      titleNameTh: "คณะแพทย์",
      titleName: "คณะแพทย์",
      titleNameEn: null,
      titleGroup: "4,5",
      status: "A"
    },
    {
      titleCode: "7150",
      titleNameTh: "โครงการ",
      titleName: "โครงการ",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7160",
      titleNameTh: "ชมรม",
      titleName: "ชมรม",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7170",
      titleNameTh: "ที่ทำการ",
      titleName: "ที่ทำการ",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7180",
      titleNameTh: "มหาวิทยาลัย",
      titleName: "มหาวิทยาลัย",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7190",
      titleNameTh: "โรงเรียน",
      titleName: "โรงเรียน",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7200",
      titleNameTh: "วิทยาลัย",
      titleName: "วิทยาลัย",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7210",
      titleNameTh: "ศูนย์",
      titleName: "ศูนย์",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7220",
      titleNameTh: "สถาบัน",
      titleName: "สถาบัน",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7230",
      titleNameTh: "สมาพันธ์",
      titleName: "สมาพันธ์",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7240",
      titleNameTh: "สโมสร",
      titleName: "สโมสร",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7250",
      titleNameTh: "สหกรณ์",
      titleName: "สหกรณ์",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7251",
      titleNameTh: "ชุมนุมสหกรณ์",
      titleName: "ชุมนุมสหกรณ์",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7255",
      titleNameTh: "สหกรณ์ออมทรัพย์",
      titleName: "สหกรณ์ออมทรัพย์",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7260",
      titleNameTh: "สภาตำบล",
      titleName: "สภาตำบล",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7270",
      titleNameTh: "ศาล",
      titleName: "ศาล",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7280",
      titleNameTh: "องค์การบริหารส่วนตำบล",
      titleName: "องค์การบริหารส่วนตำบล",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7290",
      titleNameTh: "กระทรวง",
      titleName: "กระทรวง",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7300",
      titleNameTh: "กรม",
      titleName: "กรม",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7310",
      titleNameTh: "อบจ.",
      titleName: "อบจ.",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7320",
      titleNameTh: "กลุ่ม",
      titleName: "กลุ่ม",
      titleNameEn: null,
      titleGroup: "4,5",
      status: "A"
    },
    {
      titleCode: "7330",
      titleNameTh: "องค์การ",
      titleName: "องค์การ",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7340",
      titleNameTh: "วิสาหกิจชุมชน",
      titleName: "วิสาหกิจชุมชน",
      titleNameEn: null,
      titleGroup: "4,5",
      status: "A"
    },
    {
      titleCode: "7350",
      titleNameTh: "เทศบาลนคร",
      titleName: "เทศบาลนคร",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7360",
      titleNameTh: "เทศบาลเมือง",
      titleName: "เทศบาลเมือง",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7370",
      titleNameTh: "เทศบาลตำบล",
      titleName: "เทศบาลตำบล",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7380",
      titleNameTh: "วัด",
      titleName: "วัด",
      titleNameEn: null,
      titleGroup: "8",
      status: "A"
    },
    {
      titleCode: "7391",
      titleNameTh: "คริสตจักร",
      titleName: "คริสตจักร",
      titleNameEn: null,
      titleGroup: "6,8",
      status: "A"
    },
    {
      titleCode: "5119",
      titleNameTh: "คณะบุคคลโดย นพ.",
      titleName: "คณะบุคคลโดย นพ.",
      titleNameEn: null,
      titleGroup: "4",
      status: "A"
    },
    {
      titleCode: "5118",
      titleNameTh: "คณะบุคคล นาง",
      titleName: "คณะบุคคล นาง",
      titleNameEn: null,
      titleGroup: "4",
      status: "A"
    },
    {
      titleCode: "5117",
      titleNameTh: "คณะบุคคล นาย",
      titleName: "คณะบุคคล นาย",
      titleNameEn: null,
      titleGroup: "4",
      status: "A"
    },
    {
      titleCode: "5120",
      titleNameTh: "คณะบุคคล หสม.โดย นาย",
      titleName: "คณะบุคคล หสม.โดย นาย",
      titleNameEn: null,
      titleGroup: "4",
      status: "A"
    },
    {
      titleCode: "5311",
      titleNameTh: "คู่สมรสสามีและภริยา",
      titleName: "คู่สมรสสามีและภริยา",
      titleNameEn: null,
      titleGroup: "6,8",
      status: "A"
    },
    {
      titleCode: "7393",
      titleNameTh: "โบสถ์",
      titleName: "โบสถ์",
      titleNameEn: null,
      titleGroup: "6,8",
      status: "A"
    },
    {
      titleCode: "7410",
      titleNameTh: "มัสยิด",
      titleName: "มัสยิด",
      titleNameEn: null,
      titleGroup: "6,8",
      status: "A"
    },
    {
      titleCode: "7390",
      titleNameTh: "มิชชั่น",
      titleName: "มิชชั่น",
      titleNameEn: null,
      titleGroup: "6,8",
      status: "A"
    },
    {
      titleCode: "7392",
      titleNameTh: "อาสนวิหาร",
      titleName: "อาสนวิหาร",
      titleNameEn: null,
      titleGroup: "6,8",
      status: "A"
    }
  ]

export const thaiPrefixes = [
    "นาย", "นาง", "น.ส.", "ม.ร.ว.", "ม.ร.ว.หญิง", "ม.ล.", "ม.ล.หญิง", "หม่อม", "พระ",
    "ด.ช.", "ด.ญ.", "ท่านผู้หญิง", "ท่านผู้หญิง ม.ร.ว.หญิง", "คุณหญิง", "คุณหญิง พ.อ.หญิง",
    "คุณ", "ดร.", "ศ.", "ศ. ดร.", "ศ. น.พ.", "ศ. ร.ต.", "รศ.", "รศ. ดร.", "รศ. น.พ.",
    "รศ. พ.ญ.", "รศ. พ.จ.อ.", "รศ. ว่าที่ ร.ต.", "ผศ.", "ผศ. ดร.", "ผศ. ท.พ.", "ผศ. ท.ญ.",
    "ผศ. ร.อ.หญิง", "น.พ.", "น.พ. ม.ร.ว.", "น.พ. ม.ล.", "น.พ. พ.ต.อ.", "น.พ. ร.ท.",
    "พ.ญ.", "พ.ญ. ม.ล.หญิง", "พ.ญ. คุณหญิง", "ท.พ.", "ท.ญ.", "ท.ญ. หม่อม", "พล.อ.",
    "พล.อ. ม.ล.", "พล.อ. หลวง", "พล.ท.", "พล.ท. ม.จ.", "พล.ท. ม.ร.ว.", "พล.ท. ม.ล.",
    "พล.ท. หลวง", "พล.ท. น.พ.", "พล.ต.", "พล.ต. ม.จ.", "พล.ต. ม.ร.ว.", "พล.ต. ม.ล.",
    "พล.ต. น.พ.", "พ.อ.", "พ.อ. ม.จ.", "พ.อ. ม.ร.ว.", "พ.อ. ม.ล.", "พ.อ. หลวง",
    "พ.อ. ขุน", "พ.อ. ดร.", "พ.อ. น.พ.", "พ.อ. พ.ญ.", "พ.ท.", "พ.ท. ม.จ.", "พ.ท. ม.ร.ว.",
    "พ.ท. ม.ล.", "พ.ท. หลวง", "พ.ท. น.พ.", "พ.ต.", "พ.ต. ม.จ.", "พ.ต. ม.ร.ว.", "พ.ต. ม.ล.",
    "พ.ต. หลวง", "พ.ต. น.พ.", "พ.ต. พ.ญ.", "ว่าที่ พ.อ.", "ว่าที่ พ.ท.", "ว่าที่ พ.ต.",
    "ส.อ.", "ส.อ. ม.ร.ว.", "ส.อ. ม.ล.", "ส.ท.", "ส.ท. ม.ล.", "ส.ต.", "พ.อ.(พิเศษ)",
    "พ.อ.(พิเศษ)ม.ร.ว.", "นนร.", "นักเรียนนายสิบ", "พล.ร.อ.", "พล.ร.อ. ม.จ.",
    "พล.ร.อ. ม.ร.ว.", "พล.ร.อ. หลวง", "พล.ร.ท.",
    "พล.ร.ท. หลวง", "พล.ร.ต.", "พล.ร.ต. ม.จ.", "พล.ร.ต. ม.ร.ว.", "พล.ร.ต. ม.ล.", "พล.ร.ต. หลวง",
    "พ.จ.อ.", "พ.จ.อ. ม.ล.", "พ.จ.ท.", "พ.จ.ต.", "นรจ.", "พล.อ.อ.", "พล.อ.อ. ม.ร.ว.",
    "พล.อ.ท.", "พล.อ.ท. ม.ร.ว.", "พล.อ.ท. ม.ล.", "พล.อ.ต.", "พล.อ.ต. ม.ร.ว.", "พล.อ.ต. ม.ล.",
    "พล.อ.ต. น.พ.", "พ.อ.อ.", "พ.อ.อ. ม.ร.ว.", "พ.อ.อ. ม.ล.", "พ.อ.ท.", "พ.อ.ต.",
    "น.อ.(พิเศษ)", "นนอ.", "นจอ.", "พล.ต.อ.", "พล.ต.ท.", "พล.ต.ท. หลวง", "พล.ต.ต.",
    "พล.ต.ต. ม.ร.ว.", "พล.ต.ต. หลวง", "พล.ต.ต. น.พ.", "พ.ต.อ.", "พ.ต.อ. ม.จ.", "พ.ต.อ. ม.ร.ว.",
    "พ.ต.อ. ม.ล.", "พ.ต.อ. น.พ.", "พ.ต.ท.", "พ.ต.ท. ม.ร.ว.", "พ.ต.ท. ม.ล.", "ร.ต. ม.ร.ว.",
    "ร.ต. ม.ล.", "ร.ต. น.พ.", "ว่าที่ ร.อ.", "ว่าที่ ร.อ. น.พ.", "ว่าที่ ร.ท.", "ว่าที่ ร.ต.",
    "ว่าที่ ร.ต. น.พ.", "จ.ส.อ.", "จ.ส.อ. ม.ร.ว.", "จ.ส.อ. ม.ล.", "จ.ส.ท.", "จ.ส.ต.",
    "จ.อ.", "จ.ท.", "จ.ต.", "พลฯ", "จ.ส.", "พล ฯ สมัคร", "สำรอง", "พล ฯ สำรองพิเศษ",
    "พล ฯ พิเศษ", "อส.ทพ.", "พล.อ.หญิง", "พล.ท.หญิง", "พล.ต.หญิง", "พ.อ.หญิง",
    "พ.อ.หญิง ม.ล.หญิง", "พ.อ.หญิง คุณหญิง", "พ.อ.หญิง พ.ญ.", "พ.อ.หญิง ท.ญ.",
    "พ.ท.หญิง", "พ.ท.หญิง คุณหญิง", "พ.ต.หญิง", "ว่าที่ พ.อ.หญิง", "ว่าที่ พ.ท.หญิง",
    "ว่าที่ พ.ต.หญิง", "ส.อ.หญิง", "ส.ท.หญิง", "ส.ต.หญิง", "พ.อ.(พิเศษ)หญิง", "ด.หญิง",
    "พล.ร.อ.หญิง", "พล.ร.ท.หญิง", "พล.ร.ต.หญิง", "พ.จ.อ.หญิง", "พ.จ.อ.หญิง ม.ล.หญิง",
    "พ.จ.ท.หญิง", "พ.จ.ต.หญิง", "น.อ.(พิเศษ)หญิง", "พล.อ.อ.หญิง", "พล.อ.ท.หญิง",
    "พล.อ.ต.หญิง", "พ.อ.อ.หญิง", "พ.อ.ท.หญิง",
    "พ.อ.ต.หญิง", "พล.ต.อ.หญิง", "พล.ต.ท.หญิง", "พล.ต.ต.หญิง", "พ.ต.อ.หญิง", "พ.ต.อ.หญิง ม.ร.ว.หญิง",
    "พ.ต.อ.หญิง พ.ญ.", "พ.ต.ท.หญิง", "พ.ต.ต.หญิง", "พ.ต.ต.หญิง พ.ญ.", "ว่าที่ พ.ต.อ.หญิง", "ว่าที่ พ.ต.ท.หญิง",
    "ว่าที่ พ.ต.ต.หญิง", "ร.ต.อ.หญิง", "ร.ต.ท.หญิง", "ร.ต.ต.หญิง", "ร.ต.ต.หญิง พ.ญ.", "ว่าที่ ร.ต.อ.หญิง",
    "ว่าที่ ร.ต.ท.หญิง", "ว่าที่ ร.ต.ต.หญิง", "ส.ต.อ.หญิง", "ส.ต.ท.หญิง", "ส.ต.ต.หญิง", "พ.ต.อ.(พิเศษ)หญิง",
    "ด.ต.หญิง", "น.อ.หญิง", "น.อ.หญิง ม.ล.หญิง", "น.อ.หญิง พ.ญ.", "น.ท.หญิง", "น.ท.หญิง ม.ล.หญิง",
    "น.ท.หญิง พ.ญ.", "น.ต.หญิง", "น.ต.หญิง ม.ล.หญิง", "น.ต.หญิง พ.ญ.", "ว่าที่ น.อ.หญิง", "ว่าที่ น.ท.หญิง",
    "ว่าที่ น.ต.หญิง", "ร.อ.หญิง", "ร.อ.หญิง ม.ร.ว.หญิง", "ร.อ.หญิง ม.ล.หญิง", "ร.อ.หญิง พ.ญ.",
    "ร.ท.หญิง", "ร.ท.หญิง ม.ล.", "ร.ต.หญิง", "ร.ต.หญิง ม.ล.หญิง", "ร.ต.หญิง พ.ญ.", "ว่าที่ ร.อ.หญิง",
    "ว่าที่ ร.ท.หญิง", "ว่าที่ ร.ต.หญิง", "จ.ส.อ.หญิง", "จ.ส.ท.หญิง", "จ.ส.ต.หญิง", "จ.อ.หญิง",
    "จ.อ.หญิง ม.ล.หญิง", "จ.ท.หญิง", "จ.ต.หญิง", "พลฯหญิง", "อส.หญิง", "จ.ส.หญิง", "พล ฯ สมัครหญิง",
    "พล ฯ สำรองหญิง", "พล ฯ สำรองพิเศษหญิง", "พล ฯ พิเศษหญิง", "พ.ต.ท. ดร.", "พ.ต.ท. น.พ.", "พ.ต.ต.",
    "พ.ต.ต. ม.ล.", "พ.ต.ต. น.พ.", "ว่าที่ พ.ต.อ.", "ว่าที่ พ.ต.ท.", "ว่าที่ พ.ต.ต.", "ร.ต.อ.", "ร.ต.อ. ม.ร.ว.",
    "ร.ต.อ. ม.ล.", "ร.ต.อ. ดร.", "ร.ต.อ. น.พ.", "ร.ต.ท.", "ร.ต.ต.", "ร.ต.ต. ม.ล.", "ว่าที่ ร.ต.อ.",
    "ว่าที่ ร.ต.ท.", "ว่าที่ ร.ต.ต.", "ส.ต.อ.", "ส.ต.อ. ม.ล.", "ส.ต.ท.", "ส.ต.ท. ม.ล.", "ส.ต.ต.",
    "พ.ต.อ.(พิเศษ)", "ด.ต.", "ด.ต. ม.ล.", "นรต."
  ];