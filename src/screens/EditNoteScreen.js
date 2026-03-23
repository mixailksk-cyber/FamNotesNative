import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Share } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../components/Header';
import ColorPickerModal from '../components/ColorPickerModal';
import { getBrandColor, TITLE_MAX_LENGTH, NOTE_MAX_LENGTH } from '../utils/constants';

const EditNoteScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { note: initialNote, onSave } = route.params || {};
  const [settings, setSettings] = useState({ brandColor: '#20A0A0' });
  const brandColor = getBrandColor(settings);

  const [note, setNote] = useState(initialNote || {
    id: Date.now().toString(),
    title: '',
    content: '',
    color: brandColor,
    folder: 'Главная',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deleted: false,
    pinned: false,
    locked: false,
  });
  const [showColor, setShowColor] = useState(false);
  const [isEditing, setIsEditing] = useState(!initialNote?.title && !initialNote?.content);
  const contentInputRef = useRef(null);
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (isEditing && contentInputRef.current && !note.locked) {
      setTimeout(() => contentInputRef.current.focus(), 100);
    }
  }, [isEditing, note.locked]);

  const handleBack = () => {
    if (hasChanges()) {
      Alert.alert(
        'Несохраненные изменения',
        'У вас есть несохраненные изменения. Выйти без сохранения?',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Выйти', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const hasChanges = () => {
    if (!initialNote) return note.title !== '' || note.content !== '';
    return initialNote.title !== note.title || initialNote.content !== note.content || initialNote.color !== note.color;
  };

  const handleSave = () => {
    if (onSave) {
      const noteToSave = { ...note, updatedAt: Date.now() };
      onSave(noteToSave);
    }
    setIsEditing(false);
    navigation.goBack();
  };

  const handleShare = async () => {
    try {
      const message = note.title ? `${note.title}\n\n${note.content}` : note.content;
      await Share.share({ message, title: note.title || 'Заметка' });
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Удалить заметку',
      note.folder === 'Корзина' ? 'Удалить навсегда?' : 'Переместить в корзину?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', onPress: () => {
          if (onSave) {
            const updatedNote = { ...note, folder: 'Корзина', deleted: true, pinned: false, updatedAt: Date.now() };
            onSave(updatedNote);
          }
          navigation.goBack();
        } }
      ]
    );
  };

  const handleUnlock = () => {
    setNote({ ...note, locked: false });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'white' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Header
        title={isEditing ? "Редактирование" : "Просмотр"}
        showBack
        onBack={handleBack}
        rightIcon="settings"
        onRightPress={() => navigation.navigate('Settings')}
        showPalette
        onPalettePress={() => setShowColor(true)}
        showSearch={false}
        settings={settings}
      >
        {note.locked && !isEditing && (
          <TouchableOpacity onPress={handleUnlock}>
            <Icon name="lock" size={24} color="white" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleShare}>
          <Icon name="share" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <Icon name="delete" size={24} color="white" />
        </TouchableOpacity>
      </Header>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {isEditing ? (
            <TextInput
              ref={titleInputRef}
              style={{ fontSize: 18, fontWeight: 'bold', paddingVertical: 8, color: '#333' }}
              placeholder="Заголовок"
              placeholderTextColor="#999"
              maxLength={TITLE_MAX_LENGTH}
              value={note.title}
              onChangeText={t => setNote({ ...note, title: t })}
              editable={!note.locked}
            />
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)} activeOpacity={0.7}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', paddingVertical: 8, color: '#333' }}>
                {note.title || 'Заголовок'}
              </Text>
            </TouchableOpacity>
          )}
          <View style={{ height: 2, backgroundColor: note.color || brandColor, width: '100%', marginTop: 4 }} />
        </View>

        {isEditing ? (
          <TextInput
            ref={contentInputRef}
            style={{ fontSize: 16, paddingHorizontal: 16, paddingVertical: 12, textAlignVertical: 'top', color: '#333', minHeight: 200 }}
            placeholder="Текст заметки..."
            placeholderTextColor="#999"
            multiline
            maxLength={NOTE_MAX_LENGTH}
            value={note.content}
            onChangeText={t => setNote({ ...note, content: t })}
            editable={!note.locked}
          />
        ) : (
          <Text
            selectable
            style={{ fontSize: 16, paddingHorizontal: 16, paddingVertical: 12, color: '#333', lineHeight: 24 }}
          >
            {note.content || '...'}
          </Text>
        )}
      </ScrollView>

      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 70,
          height: 70,
          borderRadius: 35,
          backgroundColor: note.color || brandColor,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5,
          opacity: note.locked && !isEditing ? 0.5 : 1
        }}
        onPress={isEditing ? handleSave : () => setIsEditing(true)}
        disabled={note.locked && !isEditing}
      >
        <Icon name={isEditing ? "check" : "edit"} size={36} color="white" />
      </TouchableOpacity>

      <ColorPickerModal
        visible={showColor}
        onClose={() => setShowColor(false)}
        selectedColor={note.color}
        onSelect={(color) => setNote({ ...note, color })}
        settings={settings}
      />
    </KeyboardAvoidingView>
  );
};

export default EditNoteScreen;
