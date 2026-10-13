import React, { useEffect, useState, useCallback, memo, useRef, useMemo } from 'react';
import { View, KeyboardAvoidingView, Text, FlatList } from 'react-native';
import { useLang } from '../../../shared/hooks';
import { useGlobal } from '../../../state/global';
import { addContact, fetchContacts, fetchFavorites, searchContacts } from './api';
import SearchBar from './SearchBar';
import ContactBar from './ContactBar';
import { ChatItem, ContactItem, RecentContactItem, SearchResultItem } from './Items';
import { SkeletonList } from './SkeletonLoader';
import { zoomStyles } from './styles';

const PAGES_TYPE = {
  HOME: 'home',
  CONTACT: 'contact',
  QR_CODE: 'qr_code',
  SEARCH: 'search',
};

const HomeZoom = memo(({ token, navigation, profile }) => {
  const { lang } = useLang();
  const { state, dispatch } = useGlobal();
  const { recentRooms, myZoomID, favoriteList } = state || {};
  
  const [search, setSearch] = useState('');
  const [data, setData] = useState(recentRooms ?? []);
  const [ownerId, setOwnerId] = useState(myZoomID ?? '');
  const [isSearch, setIsSearch] = useState(false);
  const [resultSearch, setResultSearch] = useState([]);
  const [pageType, setPageType] = useState(PAGES_TYPE.HOME);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingFavorites, setIsFetchingFavorites] = useState(false);
  
  const searchTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (!token || !isMountedRef.current) return;
    
    try {
      setIsLoading(true);
      const res = await fetchContacts(token);
      
      if (!isMountedRef.current) return;
      
      setOwnerId(res.owner_id);
      setData(res.rooms || []);
      
      if (state.recentRooms !== res.rooms) {
        dispatch({ type: 'SET_RECENT_ROOMS', payload: res.rooms || [] });
      }
      if (state.myZoomID !== res.owner_id) {
        dispatch({ type: 'SET_MY_ZOOM_ID', payload: res.owner_id });
      }
    } catch (error) {
      console.error('Fetch contacts error:', error);
      if (isMountedRef.current) {
        setData([]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [token, dispatch, state.recentRooms, state.myZoomID]);

  const fetchFavoriteContacts = useCallback(async () => {
    if (!token || !isMountedRef.current) return;
    
    try {
      setIsFetchingFavorites(true);
      const data = await fetchFavorites(token);
      
      if (!isMountedRef.current) return;
      
      dispatch({ type: 'SET_FAVORITE_LIST', payload: data.favorites || [] });
    } catch (error) {
      console.error('Fetch favorites error:', error);
      if (isMountedRef.current) {
        dispatch({ type: 'SET_FAVORITE_LIST', payload: [] });
      }
    } finally {
      if (isMountedRef.current) {
        setIsFetchingFavorites(false);
      }
    }
  }, [token, dispatch]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchData);
    return unsubscribe;
  }, [navigation, fetchData]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isSearch) {
      setPageType(PAGES_TYPE.SEARCH);
    } else {
      setPageType(PAGES_TYPE.HOME);
    }
  }, [isSearch]);

  useEffect(() => {
    if ([PAGES_TYPE.CONTACT, PAGES_TYPE.HOME].includes(pageType)) {
      fetchFavoriteContacts();
    }
  }, [pageType, fetchFavoriteContacts]);

  // Debounced search function
  const performSearch = useCallback(async (text) => {
    if (!isMountedRef.current) return;
    
    if (!text.trim()) {
      setResultSearch([]);
      setIsSearching(false);
      return;
    }
    
    try {
      setIsSearching(true);
      const response = await searchContacts({ keywords: text }, profile.token);
      if (!isMountedRef.current) return;

      setResultSearch(response.data || []);
    } catch (error) {
      console.error('Search error:', error);
      if (isMountedRef.current) {
        setResultSearch([]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsSearching(false);
      }
    }
  }, [profile.token]);

  const handleSearchChange = useCallback((text) => {
    setSearch(text);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(text);
    }, 300); 
  }, [performSearch]);

  const onEnterChat = useCallback((item) => {
    const sender = item.people?.find(person => person._id === ownerId);
    const receiver = item.people?.find(person => person._id !== ownerId);
    
    navigation.navigate('Chatbox', {
      room_id: item._id,
      counterpart: receiver?._id,
      _sender: sender,
      _receiver: receiver
    });
  }, [ownerId, navigation]);

  const onAddFriend = useCallback((item) => {
    const sender = item.people?.find(person => person._id === ownerId);
    const receiver = item.people?.find(person => person._id !== ownerId);
    
    navigation.navigate('Chatbox', {
      room_id: item._id,
      counterpart: receiver?._id,
      _sender: sender,
      _receiver: receiver
    });
  }, [ownerId, navigation]);

  const handleAddContact = useCallback(async (data) => {
    try {
      const response = await addContact({ counterpart: data.zoom_id }, profile.token);
      if (response.room) {
        onEnterChat(response.room);
      }
    } catch (error) {
      console.error('Add contact error:', error);
    }
  }, [profile.token, onEnterChat]);

  const renderChatItem = useCallback(({ item }) => (
    <ChatItem
      item={item}
      onEnterChat={onEnterChat}
      ownerId={ownerId}
      lang={lang}
    />
  ), [onEnterChat, ownerId, lang]);

  const renderContactItem = useCallback(({ item }) => (
    <ContactItem
      item={item}
      onEnterChat={onEnterChat}
      ownerId={ownerId}
    />
  ), [onEnterChat, ownerId]);

  const renderSearchResultItem = useCallback(({ item }) => (
    <SearchResultItem
      item={item}
      onEnterChat={()=>handleAddContact(item)}
      onAddFriend={()=>handleAddContact(item)}
    />
  ), [handleAddContact]);

  const keyExtractor = useCallback((item) => item._id, []);

  // Memoized empty component
  const EmptyComponent = memo(({ message }) => (
    <View style={zoomStyles.emptyContainer}>
      <Text style={zoomStyles.emptyText}>{message}</Text>
    </View>
  ));

  // Optimize FlatList performance
  const getItemLayout = useCallback((data, index) => ({
    length: 80, // Approximate item height
    offset: 80 * index,
    index,
  }), []);
  
  // Memoize favorite list for better performance
  const memoizedFavoriteList = useMemo(() => favoriteList ?? [], [favoriteList]);

  return (
    <KeyboardAvoidingView behavior="padding" style={zoomStyles.container}>
      <View style={zoomStyles.headerContainer}>
        {[PAGES_TYPE.HOME, PAGES_TYPE.SEARCH].includes(pageType) && (
          <SearchBar
            navigation={navigation}
            onClickContact={() => setPageType(PAGES_TYPE.CONTACT)}
            isSearch={isSearch}
            setIsSearch={setIsSearch}
            search={search}
            handleSearchChange={handleSearchChange}
            lang={lang}
          />
        )}
        {pageType === PAGES_TYPE.CONTACT && (
          <ContactBar
            onBack={() => setPageType(PAGES_TYPE.HOME)}
            lang={lang}
          />
        )}
      </View>

      {/* Home page - Recent chats */}
      {pageType === PAGES_TYPE.HOME && (
        <>
          {isLoading ? (
            <SkeletonList type="chat" count={8} />
          ) : (
            <FlatList
              data={data}
              renderItem={renderChatItem}
              keyExtractor={keyExtractor}
              getItemLayout={getItemLayout}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              initialNumToRender={10}
              windowSize={10}
              ListEmptyComponent={() => (
                <EmptyComponent message={lang.no_recent_chats || "No recent chats"} />
              )}
            />
          )}
        </>
      )}

      {/* Contact page - Favorites */}
      {pageType === PAGES_TYPE.CONTACT && (
        <>
          {isFetchingFavorites ? (
            <SkeletonList type="contact" count={8} />
          ) : (
            <FlatList
              data={data}
              renderItem={renderContactItem}
              keyExtractor={keyExtractor}
              getItemLayout={getItemLayout}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              initialNumToRender={10}
              windowSize={10}
              ListEmptyComponent={() => (
                <EmptyComponent message={lang.no_contacts || "Không tìm thấy kết quả"} />
              )}
            />
          )}
        </>
      )}

      {/* Search page - Search results */}
      {pageType === PAGES_TYPE.SEARCH && (
        <View style={zoomStyles.searchContainer}>
          <View style={zoomStyles.searchResultsSection}>
            <Text style={zoomStyles.sectionTitle}>
              {lang.contact_list}
            </Text>
            {isSearching ? (
              <SkeletonList type="search" count={5} />
            ) : (
              <FlatList
                data={resultSearch}
                keyExtractor={(item, index) => String(item?.zoom_id ?? item?._id ?? index)}
                renderItem={renderSearchResultItem}
                removeClippedSubviews={true}
                maxToRenderPerBatch={8}
                updateCellsBatchingPeriod={50}
                initialNumToRender={8}
                windowSize={8}
                ListEmptyComponent={() => (
                  <EmptyComponent 
                    message={search ? (lang.no_search_results || "Không tìm thấy kết quả") : (lang.start_searching || "Bắt đầu tìm kiếm")} 
                  />
                )}
              />
            )}
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
});

export default HomeZoom;