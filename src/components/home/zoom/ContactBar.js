import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { zoomStyles } from './styles';

const ContactBar = memo(({ onBack, lang }) => (
  <View style={zoomStyles.contactBarContainer}>
    <TouchableOpacity onPress={onBack}>
      <Ionicons name="chevron-back" color={'#fff'} size={20} />
    </TouchableOpacity>
    <Text style={zoomStyles.contactBarText}>{lang.contact}</Text>
  </View>
));

export default ContactBar;