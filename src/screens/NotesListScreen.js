import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import NoteItem from '../components/NoteItem';
import { getBrandColor } from '../utils/constants';

const NotesListScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [notes, setNotes] = useState([]);
  const [currentFolder, setCurrentFolder] = useState('Главная');
  const [settings, setSettings] = useState({ brandColor: '#20A0A0' });
  
  const brandColor = getBrandColor(settings);
  const isInTrash = currentFolder === 'Корзина';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem('notes');
      const savedSettings = await AsyncStorage.getItem('settings');
      
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch (e) {
      console.log('Error loading data:', e);
    }
  };

  const saveNotes = async (newNotes) => {
    setNotes(newNotes);
    await AsyncStorage.setItem('notes', JSON.stringify(newNotes));
  };

  const sortedNotes = [...notes]
    .filter(n => {
      if (currentFolder === 'Корзина') return n.deleted === true;
      return n.folder === currentFolder && !n.deleted;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });

  const handleAddNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: '',
      content: '',
      folder: currentFolder,
      color: brandColor,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deleted: false,
      pinned: false,
    };
    navigation.navigate('EditNote', { note: newNote, onSave: saveNotes });
  };

  const handleNotePress = (note) => {
    navigation.navigate('EditNote', { note, onSave: saveNotes });
  };

  const handleNoteLongPress = (note) => {
    Alert.alert(
      'Действия с заметкой',
      'Что сделать?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Переместить в корзину', onPress: () => {
          const updatedNotes = notes.map(n => 
            n.id === note.id ? { ...n, folder: 'Корзина', deleted: true, pinned: false, updatedAt: Date.now() } : n
          );
          saveNotes(updatedNotes);
        }},
        { text: 'Удалить навсегда', style: 'destructive', onPress: () => {
          const updatedNotes = notes.filter(n => n.id !== note.id);
          saveNotes(updatedNotes);
        }}
      ]
    );
  };

  const handleEmptyTrash = () => {
    Alert.alert(
      'Очистить корзину',
      'Вы уверены, что хотите безвозвратно удалить все заметки из корзины?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить все', style: 'destructive', onPress: () => {
          const updatedNotes = notes.filter(n => n.folder !== 'Корзина');
          saveNotes(updatedNotes);
        }}
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Header
        title={currentFolder}
        rightIcon="settings"
        onRightPress={() => navigation.navigate('Settings')}
        showBack
        onBack={() => navigation.navigate('Folders')}
        showSearch
        onSearchPress={() => navigation.navigate('Search', { notes })}
        showPalette={false}
        settings={settings}
      >
        {isInTrash && sortedNotes.length > 0 && (
          <TouchableOpacity onPress={handleEmptyTrash}>
            <Icon name="delete-sweep" size={24} color="white" />
          </TouchableOpacity>
        )}
      </Header>

      <FlatList
        data={sortedNotes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <NoteItem
            item={item}
            onPress={() => handleNotePress(item)}
            onLongPress={() => handleNoteLongPress(item)}
            settings={settings}
            showPin={!isInTrash}
          />
        )}
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Text style={{ color: '#999' }}>Нет заметок</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {!isInTrash && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: insets.bottom + 24,
            right: insets.right + 24,
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: brandColor,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 5
          }}
          onPress={handleAddNote}
        >
          <Icon name="add" size={36} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default NotesListScreen;
