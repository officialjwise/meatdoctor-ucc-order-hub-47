interface SmsSettings {
  clientId: string;
  clientSecret: string;
  senderId: string;
}

interface Settings {
  sms: SmsSettings;
  // Add other settings categories here as needed
}

const defaultSettings: Settings = {
  sms: {
    clientId: '',
    clientSecret: '',
    senderId: 'MeatDoctor',
  }
};

export function getSettings(): Settings {
  try {
    const settings = localStorage.getItem('meatdoctor-settings');
    return settings ? JSON.parse(settings) : defaultSettings;
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
    return defaultSettings;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem('meatdoctor-settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
    throw error;
  }
}