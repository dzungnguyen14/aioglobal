import React from 'react';
import { View, Text } from 'react-native';
import styles from './style';
import { memo } from 'react';
import { CustomImage } from '../../../images';

const Comment = ( {  item }) => {
    return (
        <View style={styles.commentContainer}>
            {item.avatar && (
                <CustomImage source={{ uri: item.avatar }} style={styles.avatarComment} />
            )}
            <View style={styles.commentInfo}>
                <Text style={styles.username}>{item.title}</Text>
                <Text style={styles.timeAgo}>{formatDateToTime(item.publish_time, lang)}</Text>
                {item.image && (
                    <CustomImage source={{ uri: item.image }} style={styles.postImage} />
                )}
            </View>
        </View>
    );
};


export default memo(Comment);
