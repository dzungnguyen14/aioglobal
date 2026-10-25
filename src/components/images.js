import React from 'react';
import { Dimensions, Platform, Image, ActivityIndicator } from "react-native";

export const LogoImage = require('../../assets/icon.png');
export const CoverImage = require('../../assets/bg-home-mobile.png');
export const AccountImage = require('../../assets/account.png');
export const BookingImage = require('../../assets/booking.png');
export const GiftImage = require('../../assets/gift.png');
export const HelpImage = require('../../assets/help.png');
export const ReceiptImage = require('../../assets/receipt.png');
export const VNEIDImage = require('../../assets/vneid.png');
export const RepairImage = require('../../assets/repair.png');
export const ReportImage = require('../../assets/report.png');
export const DigitalWalletImage = require('../../assets/digital-wallet.png');
export const BannerImage = require('../../assets/slide-1.jpg');
export const CultureImage = require('../../assets/services/culture.png');
export const EducationImage = require('../../assets/services/education.png');
export const EntertainmentImage = require('../../assets/services/entertainment.png');
export const EnviromentImage = require('../../assets/services/enviroment.png');
export const FarmImage = require('../../assets/services/farm.png');
export const LocationImage = require('../../assets/services/location.png');
export const MedicalImage = require('../../assets/services/medical.png');
export const NewsImage = require('../../assets/services/news.png');
export const ServiceImage = require('../../assets/services/service.png');
export const TrafficImage = require('../../assets/services/traffic.png');
export const TravelImage = require('../../assets/services/travel.png');
export const HealthImage = require('../../assets/services/health.png');
export const NutritionImage = require('../../assets/services/nutrition.png');
export const ChatImage = require('../../assets/chat.png');
export const BackgroundImage = require('../../assets/bg_banner.png');
export const IconXNK = require('../../assets/icons/xnk.png');
export const IconTM = require('../../assets/icons/tm.png');
export const IconGD = require('../../assets/icons/giaoduc.png');
export const IconSuKien = require('../../assets/icons/sukien.png');
export const IconTieuDung = require('../../assets/icons/tieudung.png');
export const IconDuLich = require('../../assets/icons/dulich.png');
export const IconCongNghe = require('../../assets/icons/congnghe.png');
export const IconDinhDuong = require('../../assets/icons/dinhduong.png');
export const IconSucKhoe = require('../../assets/icons/suckhoe.png');
export const ShopeeIcon = require('../../assets/suppliers/shopee.png');
export const KTSMallIcon = require('../../assets/suppliers/ktsmall.png');
export const BrowserIcon = require('../../assets/browser.png');
export const GoogleIcon = require('../../assets/google.png');
export const FacebookIcon = require('../../assets/facebook.png');

const screenWidth = Dimensions.get('window').width - 20;

export const AutoImage = ({ uri }) => {
    const [height, setHeight] = React.useState(null);

    React.useEffect(() => {
        Image.getSize(uri, (width, heightOriginal) => {
            const ratio = heightOriginal / width;
            setHeight(screenWidth * ratio);
        });
    }, [uri]);

    if (!height) {
        return <ActivityIndicator size="small" />;
    }

    return (
        <Image
            source={{ uri }}
            style={{ width: screenWidth, height, resizeMode: 'cover' }}
        />
    );
}
export const CustomImage = ({ source, style }) => {
    // Image của react-native không nhận chuỗi URL, phải bọc thành { uri }
    return (
        <Image
            source={typeof source === 'string' ? { uri: source } : source}
            style={style}
            contentFit="cover"
            allowDownscaling
        />
    )
}