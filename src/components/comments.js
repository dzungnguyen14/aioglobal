import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import styles from "../styles/global";
import { fetchPostComments, postComment } from '../fetcher/api';
import TextField from './textInput';
import { useLang } from '../shared/hooks';
import TextareaField from './textarea';


const PostComments = (props) => {
    const { lang } = useLang();

    const { post_id, token } = props;
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);
    
    const onReset = () => {
        setComment("");
    }

    const onLoadComment = async () => {
        const response = await fetchPostComments({ post_id: post_id }, token);
        setComments(response.comments ?? []);
    }

    const onSend = async () => {
        await postComment({
            post_id: post_id,
            content: comment,
            video: ''
        }, token);

        onReset();
        onLoadComment();
    }

    useEffect(() => {
        onLoadComment();
    }, []);

    const RenderItem = ({ item }) => {
        return (
            <View style={{ flex: 1, flexDirection: 'collumn' }}>
                <View style={{
                    flex: 1,
                    flexDirection: 'column',
                    backgroundColor: '#f0f2f5',
                    borderRadius: 10,
                    padding: 10,
                    rowGap:5
                }}>
                    <Text style={{ fontSize: 13, fontWeight: '700'}}>{item.account.fullname}</Text>
                    <Text style={{ fontSize: 12}}>{ item.content }</Text>
                </View>
                <View style={{
                    padding: 5,
                    justifyContent: 'center',
                    alignContent: 'flex-end',
                    alignItems: 'flex-end',
                }}>
                    <Text style={{ fontSize:11, color: '#444950'}}>{item.created_at}</Text>
                </View>
            </View>
        )
    };

    return (
        <View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#fff', padding: 10, marginBottom: 20 }}>
            {comments.map(item => <RenderItem item={item} key={item.id} /> )}
            <View style={{ position: 'relative', paddingRight: 50}}>
                <TextareaField
                    hideLabel
                    value={comment}
                    onChange={(value) => setComment(value)}
                    placeholder={lang.enter_your_comment}
                    onPressEnter={onSend}
                    required
                />
                <TouchableOpacity style={{ position: 'absolute', right: 10, top: 30}} onPress={onSend}>
                    <Text style={{ color: comment != '' ? 'blue' : '#ddd', fontSize: 14 }}>{lang.send}</Text>
                </TouchableOpacity>
            </View>
        </View>
        
    );
};


export default PostComments;