import { Modal } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useEffect, useState, useRef } from "react";
import docxIcon from '@/assets/image/icon/doc.webp';
import xlsxIcon from '@/assets/image/icon/xls.webp';
import pptxIcon from '@/assets/image/icon/ppt.webp';
import compressedIcon from '@/assets/image/icon/zip.webp';
import textIcon from '@/assets/image/icon/txt.webp';
import otherIcon from '@/assets/image/icon/file.webp';



interface ModalMoreFileProps {
    open: boolean;
    onClose: () => void;
    moreFileUrl: string;
    memeType: string;
    mainType: string;
    type: string;
    nameFile: string;
    pdfUrl?: string;
}

export const ModalMoreFile: React.FC<ModalMoreFileProps> = ({
    open,
    onClose,
    moreFileUrl,
    memeType,
    nameFile,
    mainType,
    type,
    pdfUrl,
}) => {
    const [moreFileUrlState, setMoreFileUrlState] = useState<string>(moreFileUrl || "");
    const [mimeTypeState, setMimeTypeState] = useState<string>(memeType || "");
    const [mainTypeState, setMainTypeState] = useState<string>(mainType || "");
    const [typeState, setTypeState] = useState<string>(type || "");
    const [nameFileState, setNameFileState] = useState<string>(nameFile || "");
    const audioRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);


    useEffect(() => {
        setMoreFileUrlState(moreFileUrl || "");
        setMimeTypeState(memeType || "");
        setNameFileState(nameFile || "");
        setMainTypeState(mainType || "");
        setTypeState(type || "");
    }, [moreFileUrl, memeType, nameFile, mainType, type, open]);

    

    const handleDownloadPdf = () => {
        if (!moreFileUrl) return;
        const link = document.createElement("a");
        link.href = moreFileUrl;
        link.download = nameFileState || '';
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    const handleClose = () => {
        // Stop audio or video playback when closing modal
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
        
        setMoreFileUrlState("");
        setMimeTypeState("");
        setNameFileState("");
        setMainTypeState("");
        setTypeState("");
        onClose();
    }

    const renderContent = () => {
        // memeType is image, pdf, audio, video, text, compressed, office, other

        // const url = 'http://inet-s3-object-gw.inet.co.th/tid-e-contract-minio-uat/175128061064325/transactions/68df45cd608faf85a343272c/attachments/microsoft_office/1759463243776/0-0-Project-Progress-Update_03102025104723.pptx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=SREij89qYxhrBctZlhiP%2F20251003%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20251003T041851Z&X-Amz-Expires=3600&X-Amz-Signature=85145944ec36ab59de177920e6aeaf7c2aa812951edbb362936f74c923a156b6&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject'
        // const url = 'https://inet-s3-object-gw.inet.co.th/tid-e-contract-minio-uat/175128061064325/transactions/68df45cd608faf85a343272c/attachments/microsoft_office/1759463243776/0-0-Project-Progress-Update_03102025104723.pptx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=SREij89qYxhrBctZlhiP%2F20251003%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20251003T043811Z&X-Amz-Expires=3600&X-Amz-Signature=e71da295634f723254171b9bfbf47b0399c3089061f7f4d853d8e19a215beb55&X-Amz-SignedHeaders=host&response-content-type=application%2Fvnd.openxmlformats-officedocument.presentationml.presentation&x-amz-checksum-mode=ENABLED&x-id=GetObject'
        if (!moreFileUrlState) return <></>;
        switch (mainTypeState) {
            case 'image':
                return <img key={moreFileUrlState} src={moreFileUrlState} alt="Image" />;
            case 'pdf':
                return <iframe key={moreFileUrlState} src={moreFileUrlState} width="100%" height="750px" />;
            case 'audio':
                return <audio key={moreFileUrlState} ref={audioRef} controls className="flex justify-center items-center max-h-[750px]">
                            {
                                type === 'mp3' ? <source src={moreFileUrlState} type={`audio/mpeg`} /> : 
                                type === 'wav' ? <source src={moreFileUrlState} type={`audio/wav`} /> :
                                type === 'ogg' ? <source src={moreFileUrlState} type={`audio/ogg`} /> :
                                type === 'aac' ? <source src={moreFileUrlState} type={`audio/aac`} /> :
                                type === 'flac' ? <source src={moreFileUrlState} type={`audio/flac`} /> :
                                <source src={moreFileUrlState} type={`audio/${type}`} />
                            }
                    </audio>;
            case 'video':
                return <video key={moreFileUrlState} ref={videoRef} controls className="max-h-[750px]">
                            <source src={moreFileUrlState} type={`video/mp4`} />
                    </video>;
            case 'office': 
                // Office files cannot be previewed directly in browser
                // Show download message instead
                return (
                    <div className="flex flex-col items-center justify-center h-[500px] gap-4">
                        <div className="text-center">
                            <div className="text-6xl mb-4 flex justify-center items-center">
                                {typeState === 'docx' && (<img src={docxIcon.src} width={100} height={100} alt="Docx" />)}
                                {typeState === 'xlsx' && (<img src={xlsxIcon.src} width={100} height={100} alt="Xlsx" />)}
                                {typeState === 'pptx' && (<img src={pptxIcon.src} width={100} height={100} alt="Pptx" />)}
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                ไฟล์ {typeState?.toUpperCase()}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {nameFileState}
                            </p>
                            <p className="text-gray-500">
                                ไม่สามารถแสดงตัวอย่างไฟล์ Office ได้
                                <br />
                                กรุณาดาวน์โหลดไฟล์เพื่อดูเนื้อหา
                            </p>
                        </div>
                    </div>
                );
            case 'text':
                return <iframe key={moreFileUrlState} src={moreFileUrlState} width="100%" height="750px" />;
                default:
                return (
                    <div className="flex flex-col items-center justify-center h-[500px] gap-4">
                        <div className="text-center">
                            <div className="text-6xl mb-4 flex justify-center items-center">
                                {mainType === 'compressed' && (<img src={compressedIcon.src} width={100} height={100} alt="Compressed" />)}
                                {/* {mainType === 'text' && (<img src={textIcon.src} width={100} height={100} />)} */}
                                {mainType === 'other' && (<img src={otherIcon.src} width={100} height={100} alt="Other" />)}
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                ไฟล์ {type?.toUpperCase()}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {nameFileState}
                            </p>
                            <p className="text-gray-500">
                                ไม่สามารถแสดงตัวอย่างไฟล์ {type?.toUpperCase()} ได้
                                <br />
                                กรุณาดาวน์โหลดไฟล์เพื่อดูเนื้อหา
                            </p>
                        </div>
                    </div>
                );
        }
    }
    return (
        <Modal 
            open={open} 
            onCancel={handleClose}
            footer={[]}
            maskClosable={false}
            width={800}
            >
            <div className="flex flex-col justify-center items-center m-4">
                {renderContent()}
                <button onClick={handleDownloadPdf} className="btn-theme mt-2">
                    <DownloadOutlined /> บันทึก File {type?.toUpperCase()}
                </button>
            </div>
        </Modal>
    );
};