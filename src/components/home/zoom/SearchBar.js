import React, { memo } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DropdownAction from '../../dropdown-action';
import { ACTION_OPTIONS } from './constants';
import { zoomStyles } from './styles';

const SearchBar = memo(({ 
  isSearch, 
  setIsSearch, 
  search, 
  handleSearchChange, 
  lang, 
  onClickContact, 
  navigation 
}) => {
  const handleToggleSearch = () => setIsSearch(!isSearch);

  if (isSearch) {
    return (
      <View style={zoomStyles.searchBarContainer}>
        <TouchableOpacity style={zoomStyles.searchButton} onPress={handleToggleSearch}>
          <Ionicons name="chevron-back" color={'#fff'} size={25} />
        </TouchableOpacity>
        <TextInput
          clearButtonMode="always"
          style={zoomStyles.searchInput}
          value={search}
          onChangeText={handleSearchChange}
          placeholder={lang.search}
          autoFocus
        />
      </View>
    );
  }

  return (
    <View style={zoomStyles.searchBarContainer}>
      <TouchableOpacity style={zoomStyles.searchButton} onPress={handleToggleSearch}>
        <Ionicons name="search" color={'#fff'} size={16} />
      </TouchableOpacity>
      <Text onPress={handleToggleSearch} style={zoomStyles.searchText}>
        {lang.search}
      </Text>
      <View style={zoomStyles.toolbarContainer}>
        <TouchableOpacity style={zoomStyles.toolbarButton} onPress={() => navigation.navigate('Browser', { browserUrl: "https://google.com/search?q=ktsmaill" })}>
          <Ionicons name="globe" color={'#fff'} size={15} />
          <Text style={zoomStyles.toolbarButtonText}>{lang.browser}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={zoomStyles.toolbarButton} onPress={() =>navigation.navigate('DigitalWallet')}  >
          <Ionicons name="qr-code" color={'#fff'} size={15} />
          <Text style={zoomStyles.toolbarButtonText}>{lang.scan_qr}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={zoomStyles.toolbarButton} onPress={onClickContact}>
          <Ionicons name="people" color={'#fff'} size={15} />
          <Text style={zoomStyles.toolbarButtonText}>{lang.contact}</Text>
        </TouchableOpacity>
        <DropdownAction
          options={ACTION_OPTIONS}
          buttonLabel={'Add'}
          buttonContent={<Ionicons name="add" size={15} color="#fff" />}
          onSelect={(action) => {
            if (action.id === 'add_friend') { 
              handleToggleSearch();
            }
          }}
        />
      </View>
    </View>
  );
});

export default SearchBar;