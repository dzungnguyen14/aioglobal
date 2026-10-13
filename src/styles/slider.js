import { Dimensions, StyleSheet } from "react-native";

export default StyleSheet.create({
  sliderContainer: {
    flex: 1,
    width: Dimensions.get('window').width,
    flexDirection: "row",
    marginVertical: 10,
  },
  itemSliderContainer: {
    flex: 1,
    flexDirection: 'collumn',
    marginRight: 40,
    gap: 10,
  },
  itemSliderImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  selectItemSliderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  itemSliderText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '500'
  }
});