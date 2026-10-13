import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomImage } from '../../images';
import { ContactAvatar } from './constants';
import { formatDateToTime } from '../../../shared/utils';
import { zoomStyles } from './styles';

const SearchContactAvatar = memo(({ account }) => {
  if (!account) return null;
  
  if (account.avatar) {
    return (
      <CustomImage
        source={{ uri: account.avatar }}
        style={zoomStyles.avatarContainer}
      />
    );
  }
  
  return (
    <View style={zoomStyles.avatarContainer}>
      <Text style={zoomStyles.avatarText}>
        {account.name?.charAt(0)?.toUpperCase() || '?'}
      </Text>
    </View>
  );
});

const ChatItem = memo(({ item, onEnterChat, ownerId, lang }) => {
  const receiver = item.people?.find(person => person._id !== ownerId);
  const isAuthor = item.lastMessage?.author === ownerId;
  
  // Memoize truncated message
  const truncatedMessage = item.lastMessage?.content?.length > 25 
    ? `${item.lastMessage.content.substring(0, 25)}...`
    : item.lastMessage?.content;

  if (!receiver) return null;
  
  return (
    <TouchableOpacity
      onPress={() => onEnterChat(item)}
      style={zoomStyles.chatItemContainer}
      activeOpacity={0.7}
    >
      <ContactAvatar account={receiver} />
      <View style={zoomStyles.chatItemContent}>
        <Text style={zoomStyles.chatItemName} numberOfLines={1}>
          {receiver.firstName} {receiver.lastName}
        </Text>
        {item.lastMessage && (
          <Text style={zoomStyles.chatItemMessage} numberOfLines={1}>
            {isAuthor && "Bạn: "}
            {truncatedMessage}
          </Text>
        )}
      </View>
      {item.lastUpdate && (
        <Text style={zoomStyles.chatItemTime}>
          {formatDateToTime(item.lastUpdate, lang)}
        </Text>
      )}
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.item._id === nextProps.item._id &&
    prevProps.item.lastUpdate === nextProps.item.lastUpdate &&
    prevProps.ownerId === nextProps.ownerId
  );
});

const ContactItem = memo(({ item, onEnterChat, ownerId }) => {
  const receiver = item.people?.find(person => person._id !== ownerId);
  
  if (!receiver) return null;

  return (
    <View style={zoomStyles.contactItemContainer}>
      <ContactAvatar account={receiver} />
      <View style={zoomStyles.chatItemContent}>
        <Text style={zoomStyles.chatItemName} numberOfLines={1}>
          {receiver.firstName} {receiver.lastName}
        </Text>
      </View>
      <View style={zoomStyles.contactActions}>
        <TouchableOpacity 
          style={zoomStyles.contactActionButton}
          onPress={() => onEnterChat(item)}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbox-outline" color={'gray'} size={20} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={zoomStyles.contactActionButton}
          onPress={() => onEnterChat(item)}
          activeOpacity={0.7}
        >
          <Ionicons name="videocam-outline" color={'gray'} size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.item._id === nextProps.item._id &&
    prevProps.ownerId === nextProps.ownerId
  );
});

const RecentContactItem = memo(({ item, onEnterChat, ownerId }) => {
  const receiver = item.people?.find(person => person._id !== ownerId);
  
  if (!receiver) return null;

  return (
    <TouchableOpacity
      onPress={() => onEnterChat(item)}
      style={zoomStyles.recentContactItem}
      activeOpacity={0.7}
    >
      <ContactAvatar account={receiver} />
      <Text style={zoomStyles.recentContactName} numberOfLines={1}>
        {receiver.firstName}
      </Text>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.item._id === nextProps.item._id &&
    prevProps.ownerId === nextProps.ownerId
  );
});

const SearchResultItem = memo(({ item, onEnterChat, onAddFriend }) => (
  <View style={zoomStyles.searchResultItem}>
    <SearchContactAvatar account={item} />
    <View style={zoomStyles.searchResultContent}>
      <Text style={zoomStyles.searchResultName} numberOfLines={1}>{item.name}</Text>
    </View>
    <View style={[zoomStyles.searchResultActions, { flexDirection: 'row', gap: 10 }]}>
      <TouchableOpacity
        style={zoomStyles.chatButton}
        onPress={() => onEnterChat(item)}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbox" color={"#3B82F6"} size={14} />
      </TouchableOpacity>
      <TouchableOpacity
        style={zoomStyles.addFriendButton}
        onPress={() => onAddFriend(item)}
        activeOpacity={0.8}
      >
        <Ionicons name="person-add" color={"#3B82F6"} size={14} />
      </TouchableOpacity>
    </View>
  </View>
), (prevProps, nextProps) => {
  return (
    prevProps.item.zoom_id === nextProps.item.zoom_id ||
    prevProps.item._id === nextProps.item._id
  );
});

export {
  SearchContactAvatar,
  ChatItem,
  ContactItem,
  RecentContactItem,
  SearchResultItem,
};