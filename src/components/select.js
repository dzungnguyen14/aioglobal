import React, { useRef, useState } from 'react'
import { Picker } from '@react-native-picker/picker';
import { TouchableOpacity, Text, View } from 'react-native';
import styles from "../styles/global";

const SelectField = ({ value, onChange, options, label }) => {
    const pickerRef = useRef();
    const [show, setShow] = useState(false);
    if (!show)
        return (
            <View style={{
                marginTop: 20,
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
            }}>
                <Text style={styles.inputLabel}>{label}</Text>
                <TouchableOpacity style={styles.smallButton}
                    onPress={() => setShow(prev => !prev)}>
                    <Text style={styles.buttonLabel}>
                        {options.filter(o => o.value == value).map(o => o.label).toString()}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    return (
        <Picker ref={pickerRef} selectedValue={value} onValueChange={(value) => {
            onChange(value);
            setShow(prev => !prev);
        }}
        >
            {options.map(o => {
                return <Picker.Item key={o.value} label={o.label} value={o.value} />
            })}
        </Picker>
    )
}

export default SelectField;