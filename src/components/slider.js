import React, { useState } from 'react';
import { View, Text, Dimensions, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import styles from "../styles/slider";
import { CustomImage, KTSMallIcon, ShopeeIcon } from './images';


const CustomSlider = (props) => {
    const { supliers, navigation } = props;
    const { width } = Dimensions.get('window');
    const [selectIndex, setSelectIndex] = useState(supliers.length > 2 ? 1 : 0);
    const RenderPlaceHolder = () => {
        return (
            <>
                <TouchableOpacity style={styles.itemSliderContainer} onPress={() => {
                    navigation.navigate('Webview', { name: 'Shopee', url: "https://shopee.vn" });
                }}>
                    <Image source={ShopeeIcon} style={styles.itemSliderImage} />
                    <Text style={styles.itemSliderText}>Shopee</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.itemSliderContainer} onPress={() => {
                    navigation.navigate('Webview', { name: 'KTSMall', url: "https://ktsmall.com.vn" });
                }}>
                    <CustomImage source={KTSMallIcon} style={styles.itemSliderImage} />
                    <Text style={styles.itemSliderText}>KTSMall</Text>
                </TouchableOpacity>
            </>
        )
    }
    const RenderItem = ({ item, id }) => {
        return (
            <TouchableOpacity style={styles.itemSliderContainer} onPress={() => {
                navigation.navigate('Webview', { name: item.label, url: item.url });
            }}>
                <Image style={selectIndex == id ? styles.itemSliderImage : styles.itemSliderImage} source={{ uri: item.image }} />
                <Text style={styles.itemSliderText}>{item.label}</Text>
            </TouchableOpacity>
        )
    }
    const onSwipe = (event) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / width);
        setSelectIndex(index);
    }
    return (
        <ScrollView horizontal style={[styles.sliderContainer, { paddingLeft: 30, width: Dimensions.get('screen').width * 0.9 }]} showsHorizontalScrollIndicator={false} onScroll={onSwipe}>
            {supliers.length > 0 && supliers.map((item, index) => <RenderItem item={item} key={index} id={index} />)}
            {/* {supliers.length == 0 && <RenderPlaceHolder />} */}
        </ScrollView>
    );
};


export default CustomSlider;