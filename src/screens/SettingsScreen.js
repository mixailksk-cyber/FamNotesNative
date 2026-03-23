import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import { getBrandColor } from '../utils/constants';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [settings, setSettings] = useState({ brandColor: '#20A0A0', fontSize: 16 });
  const brandColor = getBrandColor(settings);

  const fontSizeOptions = [14, 16, 18, 20, 22, 24];

  const handleFontSizeChange = (size) => {
    setSettings({ ...settings, fontSize: size });
    AsyncStorage.setItem('settings', JSON.stringify({ ...settings, fontSize: size }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Header
        title="Настройки"
        showBack
        onBack={() => navigation.goBack()}
        showSearch
        settings={settings}
      />
      
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 }}>Размер текста</Text>
          <View style={{ backgroundColor: '#F8F9FA', borderRadius: 16, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap' }}>
              {fontSizeOptions.map((size) => (
                <TouchableOpacity
                  key={size}
                  onPress={() => handleFontSizeChange(size)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: settings.fontSize === size ? brandColor : '#F0F0F0',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: 4
                  }}
                >
                  <Text style={{ color: settings.fontSize === size ? 'white' : '#666' }}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
