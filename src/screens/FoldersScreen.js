import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { getBrandColor } from '../utils/constants';

const FoldersScreen = () => {
  const navigation = useNavigation();
  const [folders, setFolders] = useState(['Главная', 'Корзина']);
  const [settings, setSettings] = useState({ brandColor: '#20A0A0' });
  const brandColor = getBrandColor(settings);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const savedFolders = await AsyncStorage.getItem('folders');
      const savedSettings = await AsyncStorage.getItem('settings');
      if (savedFolders) setFolders(JSON.parse(savedFolders));
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch (e) {
      console.log('Error loading folders:', e);
    }
  };

  const saveFolders = async (newFolders) => {
    setFolders(newFolders);
    await AsyncStorage.setItem('folders', JSON.stringify(newFolders));
  };

  const handleAddFolder = () => {
    Alert.prompt(
      'Новая папка',
      'Введите название папки:',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Создать', onPress: (name) => {
          if (name && name.trim()) {
            const newFolders = [...folders.filter(f => f !== 'Главная' && f !== 'Корзина'), name.trim(), 'Корзина'];
            newFolders.sort((a, b) => {
              if (a === 'Главная') return -1;
              if (b === 'Главная') return 1;
              if (a === 'Корзина') return 1;
              if (b === 'Корзина') return -1;
              return a.localeCompare(b, 'ru');
            });
            saveFolders(['Главная', ...newFolders.slice(1, -1), 'Корзина']);
          }
        }}
      ],
      'plain-text'
    );
  };

  const handleFolderPress = (folder) => {
    navigation.navigate('NotesList', { folder });
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Header
        title="Папки"
        showBack
        onBack={() => navigation.goBack()}
        showSearch
        settings={settings}
      />
      
      <FlatList
        data={folders}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleFolderPress(item)}
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderColor: '#E0E0E0',
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: item === 'Корзина' ? '#FF6B6B' : brandColor,
              marginRight: 16,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {item === 'Корзина' ? (
                <Icon name="delete" size={24} color="white" />
              ) : (
                <Icon name="folder" size={24} color="white" />
              )}
            </View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1 }}>{item}</Text>
          </TouchableOpacity>
        )}
      />
      
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 70,
          height: 70,
          borderRadius: 35,
          backgroundColor: brandColor,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5
        }}
        onPress={handleAddFolder}
      >
        <Icon name="add" size={36} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default FoldersScreen;
