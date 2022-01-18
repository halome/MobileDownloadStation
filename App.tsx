/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import * as S from './App.style';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {Button, InputItem, List, Provider} from '@ant-design/react-native';
import axios, {AxiosResponse} from 'axios';

interface FormData {
  address: string;
  port: number;
  account: string;
  passwd: string;
}

const initialFormData: FormData = {
  address: '192.168.0.66',
  port: 5000,
  account: 'ios',
  passwd: 'Gy6p;0/{',
};

enum Status {
  IDLE,
  SENDING,
  SUCCESS,
  FAIL,
}

const serialize = obj => {
  let str = [];
  for (let p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  return str.join('&');
};

const App = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [status, setStatus] = useState<Status>(Status.IDLE);

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  const initializeSynology = async () => {
    console.log(`initializeSynology`);
    setStatus(Status.SENDING);

    //api=SYNO.API.Info&version=1&method=query&query=ALL
    const params = {
      api: 'SYNO.API.Info',
      version: 1,
      method: 'query',
      query: 'ALL',
    };

    const url = `http://${
      formData.address
    }:${formData.port.toString()}/webapi/entry.cgi?${serialize(params)}`;

    const response = await axios.get(url, {
      headers: {
        'Content-type': 'Application/json',
        Accept: 'Application/json',
      },
    });
    console.log(JSON.stringify(response.data.success));

    return response.data;
  };

  const logIn = async data => {
    const api = 'SYNO.API.Auth';
    const authData = data.data[api];
    const authPath = authData.path;
    const authVersion = authData.maxVersion;

    const params = {
      api,
      version: authVersion,
      method: 'login',
      account: formData.account,
      passwd: formData.passwd,
      // device_name: 'ios',
      // device_id: 'raf_ios',
      // login: formData.login,
      // passwd: formData.password,
      // session: 'Download Station',
      // format: 'sid',
    };

    const url = `http://${
      formData.address
    }:${formData.port.toString()}/webapi/${authPath}?${serialize(params)}`;

    console.log(`logIn, ${url}`);
    try {
      const response = await axios.get(url);

      console.log(JSON.stringify(response.data));
      setStatus(response.data.success === true ? Status.SUCCESS : Status.FAIL);
    } catch (err) {
      console.log(`error: ${err}`);
      setStatus(Status.FAIL);
    }
  };

  const onLogout = async () => {
    const url = `http://${
      formData.address
    }:${formData.port.toString()}/webapi/auth.cgi?api=SYNO.API.Auth&version=1&method=logout&session=DownloadStation`;

    setStatus(Status.SENDING);
    const response = await axios.get(url);

    console.log(JSON.stringify(response.data));
    setStatus(response.data.success === true ? Status.SUCCESS : Status.FAIL);
  };

  const onLoginButtonPress = async () => {
    const data = await initializeSynology();
    await logIn(data);
  };

  const onFormDataChange = (name: string) => (val: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: val,
    }));
  };

  return (
    <SafeAreaView
      style={backgroundStyle}
      automaticallyAdjustContentInsets={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <List>
          <InputItem
            value={formData.address}
            onChange={onFormDataChange('address')}>
            server address
          </InputItem>
          <InputItem value={formData.port.toString()} onChange={onFormDataChange('port')}>
            port
          </InputItem>
          <InputItem
            value={formData.account}
            onChange={onFormDataChange('login')}>
            login
          </InputItem>
          <InputItem
            value={formData.passwd}
            onChange={onFormDataChange('password')}
            type={'password'}>
            password
          </InputItem>
          <Button onPress={onLoginButtonPress}>Login</Button>
          <Button onPress={onLogout}>Logout</Button>

          <Text>
            Status: {status === Status.SUCCESS ? 'powodzenie' : 'błąd'}
          </Text>
          {status === Status.SENDING && <ActivityIndicator size="large" />}
        </List>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
