import React, { useState } from 'react'
import { Image, Modal, Text, TouchableOpacity, View } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';

const BudgetBtn = () => {
  const logo = require('../assets/logo.png');
  const [visible, setVisible] = useState(false);
  return (
    <View>
      <TouchableOpacity className='elevation-8 absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full'
        onPress={() => setVisible(true)}
      >
        <Image source={logo} className='h-20 w-20' />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={visible} // Change to true to show the modal
        
      >
        <View className='flex-1 items-center justify-center bg-white'>
          <TouchableOpacity
            className='absolute top-10 right-5 rounded-full bg-gray-200 p-3'
            onPress={() => setVisible(false)}
          >
            <AntDesign name="close" size={24} color="black" />
          </TouchableOpacity>
          <Text className='text-lg font-bold'>Set Your Budget</Text>
          {/* Add your budget input fields here */}
        </View>
      </Modal>
    </View>
  )
}

export default BudgetBtn