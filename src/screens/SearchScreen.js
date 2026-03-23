import React, { useState, useMemo } from 'react';
import { View, TextInput, FlatList, Text, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/Header';
import NoteItem from '../components/NoteItem';

const SearchScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { notes = [] } = route.params || {};
  const [query, setQuery] = useState('');
  const [settings, setSettings] = useState({ brandColor: '#20A0A0' });
  
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return notes.filter(note => 
      !note.deleted && (
        note.title?.toLowerCase().includes(q) ||
        note.content?.toLowerCase().includes(q)
      )
    );
  }, [query, notes]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Header
        title="Поиск"
        showBack
        onBack={() => navigation.goBack()}
        showSearch={false}
        settings={settings}
      />
      
      <View style={{ padding: 16 }}>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#E0E0E0',
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            backgroundColor: '#F5F5F5'
          }}
          placeholder="Введите текст для поиска"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <NoteItem
            item={item}
            onPress={() => navigation.navigate('EditNote', { note: item })}
            settings={settings}
          />
        )}
        ListEmptyComponent={
          query.trim() !== '' ? (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Icon name="search-off" size={48} color="#E0E0E0" />
              <Text style={{ color: '#999', marginTop: 16 }}>Ничего не найдено</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default SearchScreen;
