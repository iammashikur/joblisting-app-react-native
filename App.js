import * as React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import moment from 'moment';
import { FlatList, ImageBackground, RefreshControl, TouchableNativeFeedback, TouchableWithoutFeedback, TouchableOpacity, ActivityIndicator, StyleSheet, TextInput, Linking, Share } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Alert } from 'react-native';
import { ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Search Jobs" component={Home} options={
        {
          tabBarLabel: 'Search Jobs',

          tabBarStyle: {
            backgroundColor: '#ffffff',
            paddingBottom: 4,
          },


          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="magnify" color={color} size={20} />
          ),
          title: <View>
            <Image
              style={{
                height: 40, width: 150, contentFit: 'contain',
                position: 'relative'
              }}
              source={require('./assets/header-logo.png')}
            />
          </View>,
          headerRight: () => (
            <View style={{ marginRight: 15 }}>
              <MaterialCommunityIcons name="information-outline" color={'#000'} size={20} onPress={() => {
                Alert.alert(
                  'About',
                  'This app is developed by IT Factory Bangladesh',
                  [
                    { text: 'Ok', onPress: () => console.log('OK Pressed') }
                  ],
                  { cancelable: false }
                );
              }}
              />
            </View>
          ),



        }
      } />
      <Tab.Screen name="Job Category" component={Menu}
        options={
          {
            tabBarLabel: 'Job Category',

            tabBarStyle: {
              backgroundColor: '#ffffff',
              paddingBottom: 4,
            },


            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="briefcase-outline" color={color} size={20} />
            ),
          }
        }
      />
    </Tab.Navigator>
  );
}



export default function App() {
  return (

    <View style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor='#f3f3f3' />

      <NavigationContainer>
        <Stack.Navigator>

          <Stack.Screen
            name="Root"
            component={MyTabs}
            options={{
              headerShown: false,
            }}

          />

          <Stack.Screen name="Job" component={Job} />
          <Stack.Screen name="Category" component={Category} />
          <Stack.Screen name="SearchResults" component={SearchResults}
            // set title
            options={{
              title: 'Search Results',
            }}
          />

        </Stack.Navigator>
      </NavigationContainer>


    </View>




  );
}



const Menu = ({ navigation }) => {


  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setMenu([]);
    fetchMenuItems();
  };

  const fetchMenuItems = () => {
    axios
      .get(`https://saptahikchakrisongbad.com/api/menu/`)
      .then((response) => {
        setMenu((prevMenu) => prevMenu.concat(response.data));
        setLoading(false);
        setRefreshing(false);
      })
      .catch((error) => {
        setError(error);
      });
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const renderItem = ({ item }) => {

    return (
      <TouchableWithoutFeedback
        onPress={() => {

          navigation.navigate('Category', {
            ItemName: item.name,
            ItemId: item.id,
          });

        }}

      >

        <View style={styles.item}>
          <Image source={{ uri: item.image }} style={{ width: 50, height: 50 }} />

          <Text style={styles.text}>{item.name}</Text>
        </View>

      </TouchableWithoutFeedback>
    );

  };

  if (loading) {
    return <Spinner />;
  } else {
    return (


      <FlatList
        style={{
          backgroundColor: '#f2f2f2', paddingHorizontal: 10, paddingTop: 10,
        }}
        data={menu}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        numColumns={2}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />


    );
  }
};

const Home = ({ navigation }) => {

  const [keyword, setKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  //locations 
  const [location, setLocation] = useState([]);
  const [category, setCategory] = useState([]);

  useEffect(() => {
    axios.get('https://saptahikchakrisongbad.com/api/locations')
      .then((response) => {
        setLocation(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  //categories
  useEffect(() => {
    axios.get('https://saptahikchakrisongbad.com/api/categories')
      .then((response) => {
        setCategory(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);



  const handleSearch = () => {

    if (keyword == '') {
      Alert.alert(
        'Keyword is empty!',
        'Please enter a keyword',
        [
          { text: 'Ok', onPress: () => console.log('OK Pressed') }
        ],
        { cancelable: false }
      );
      return;
    }

    navigation.navigate('SearchResults', { keyword, selectedLocation, selectedCategory });

  };

  return (
    <ImageBackground source={require('./assets/bg.jpg')} blurRadius={10} style={{ width: '100%', height: '100%' }}
      resizeMode="cover">
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="What are you looking for?"
          value={keyword}
          onChangeText={(text) => setKeyword(text)}
        />

        <View style={styles.pickerContainer}>
          <Picker
            style={styles.picker}
            selectedValue={selectedLocation}
            onValueChange={(itemValue) => setSelectedLocation(itemValue)}
          >
            {location.map((location) => (
              <Picker.Item key={location} label={location.name} value={location} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            style={styles.picker}
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          >
            {category.map((category) => (

          
              <Picker.Item key={category} label={category.name} value={category} />


            ))}
          </Picker>
        </View>



        <TouchableOpacity style={styles.searchButton}
          onPress={handleSearch}
          rippleColor="rgba(0, 0, 0, .32)"
        >

          <FontAwesome style={{ color: 'white' }} name="search" size={16} />

          <Text style={{
            color: 'white', fontSize: 16, marginTop: 2,
          }}>
            Search
          </Text>

        </TouchableOpacity>




      </View>
    </ImageBackground>
  );
};


const Category = ({ route, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const { ItemName } = route.params;
    navigation.setOptions({ title: ItemName });
    fetchUsers(page);
  }, []);

  const fetchUsers = async () => {

    const { ItemId } = route.params;

    try {
      const response = await axios.get(`https://saptahikchakrisongbad.com/api/category/${ItemId}?page=${page}`);
      setUsers((prevJobs) => [...prevJobs, ...response.data.data]);
      setPage(page + 1);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }

  };

  const fetchMoreUsers = async () => {
    await fetchUsers();
  };

  if (loading) {
    return <Spinner />;
  } else {
    return (
      <FlatList
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          backgroundColor: '#ececeb',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 0,
        }}
        data={users}
        onEndReached={fetchMoreUsers}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <TouchableNativeFeedback
            backgroundColor="#fff"
            onPress={() => {
              navigation.navigate('Job', {
                ItemCategory: item.category,
                ItemId: item.id,
              });
            }}
          >
            <View style={styles.jobbar}>
              <View style={styles.left}>
                <Image source={{ uri: 'https://saptahikchakrisongbad.com/admin/postimages/' + item.PostImage }} style={styles.barImage} />
              </View>
              <View style={styles.right}>

                {/* max 5 words */}
                <Text style={styles.text}>{item.JobTitle.length > 50 ? item.JobTitle.substring(0, 50 - 3) + '...' : item.JobTitle}</Text>

                <Text style={{
                  color: '#555',
                  marginBottom: 5,
                  fontSize: 12,
                }}>{moment(item.PostingDate).format('MMMM Do, YYYY [at] h:mm A')}</Text>

                <View style={{ flexDirection: 'row' }}>

                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#3ace15', padding: 5, borderRadius: 5, marginRight: 5 }}>
                    <FontAwesome name="map-marker" size={12} color="#ffffff" />
                    <Text style={{
                      color: '#ffffff', fontSize: 12, marginLeft: 5,

                    }}>{item.location}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#b40456', padding: 5, borderRadius: 5 }}>
                    <FontAwesome name="briefcase" size={12} color="#ffffff" />
                    <Text style={{
                      color: '#ffffff', fontSize: 12, marginLeft: 5,

                    }}>{item.category}</Text>
                  </View>

                </View>



              </View>
            </View>
          </TouchableNativeFeedback>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    );
  }
}


const Job = (props) => {

  const { ItemCategory } = props.route.params;

  const [loading, setLoading] = useState(true);
  const [jobData, setJobData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {

    props.navigation.setOptions({ title: ItemCategory });
    fetchJobData();

  }, []);

  const fetchJobData = () => {
    const { ItemId } = props.route.params;
    axios
      .get(`https://saptahikchakrisongbad.com/api/job-details/${ItemId}`)
      .then((response) => {
        setJobData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#666" />
      </View>
    );
  } else if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>An error occurred: {error.message}</Text>
      </View>
    );
  } else {
    return (
      <ScrollView>
        <Image
          source={{
            uri: 'https://saptahikchakrisongbad.com/admin/postimages/' + jobData.PostImage,
          }}
          style={{ width: '100%', height: 300 }}
        />

        <View style={{
          padding: 10,
          backgroundColor: '#fff',

        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <View
              style={{
                backgroundColor: '#ebebeb7d',
                padding: 4,
                borderRadius: 5,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <FontAwesome name="clock-o" size={12} color="#72154b" marginLeft={4} />
              <Text style={styles.date}> {moment(jobData.PostDate).format('MMMM Do, YYYY [at] h:mm A')}</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#3ace15', padding: 5, borderRadius: 5, marginRight: 5 }}>
                <FontAwesome name="map-marker" size={12} color="#ffffff" />
                <Text style={{
                  color: '#ffffff',
                  fontSize: 12,
                  marginLeft: 5,
                }}>{jobData.location}</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#b40456', padding: 5, borderRadius: 5 }}>
                <FontAwesome name="briefcase" size={12} color="#ffffff" />
                <Text style={{
                  color: '#ffffff',
                  fontSize: 12,
                  marginLeft: 5,
                }}>{jobData.category}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.title}>{jobData.JobTitle}</Text>




          <View style={grid.gridContainer}>

            <View style={{
              width: '100%',


              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,

            }}>

              <FontAwesome name="map-marker" size={14} color="#72154b" marginRight={4} />


              <Text style={{
                color: '#555',

                fontSize: 14,
                fontWeight: '300',
              }}>
                <Text
                  style={{
                    color: '#72154b',
                    fontSize: 14,
                    fontWeight: '700',
                  }}

                >চাকরির স্থান : </Text>
                {jobData.joblocation}</Text>
            </View>


            <View style={grid.gridItem}>
              <View style={grid.innerItem}>
                <Text style={{
                  color: '#555',
                  fontSize: 14,
                  fontWeight: '100',

                }}>শিক্ষাগত যোগ্যতা</Text>
                <Text style={{

                  color: '#ff1717',
                  fontSize: 14,
                  fontWeight: '700',

                }}>{jobData.qualification}</Text>
              </View>
            </View>

            <View style={grid.gridItem}>
              <View style={grid.innerItem}>
                <Text style={{
                  color: '#555',
                  fontSize: 14,
                  fontWeight: '100',

                }}>কাজের অভিজ্ঞতা</Text>
                <Text style={{

                  color: '#ff1717',
                  fontSize: 14,
                  fontWeight: '700',

                }}>{jobData.experience}</Text>
              </View>
            </View>


            <View style={grid.gridItem}>
              <View style={grid.innerItem}>
                <Text style={{
                  color: '#555',
                  fontSize: 14,
                  fontWeight: '100',

                }}>লিঙ্গ</Text>
                <Text style={{

                  color: '#ff1717',
                  fontSize: 14,
                  fontWeight: '700',

                }}>{jobData.gender}</Text>
              </View>
            </View>


            <View style={grid.gridItem}>
              <View style={grid.innerItem}>
                <Text style={{
                  color: '#555',
                  fontSize: 14,
                  fontWeight: '100',

                }}>চাকরির সময়</Text>
                <Text style={{

                  color: '#ff1717',
                  fontSize: 14,
                  fontWeight: '700',

                }}>{jobData.jobtime}</Text>
              </View>
            </View>

            <View style={grid.gridItem}>
              <View style={grid.innerItem}>
                <Text style={{
                  color: '#555',
                  fontSize: 14,
                  fontWeight: '100',

                }}>কাজের পদবী</Text>
                <Text style={{

                  color: '#ff1717',
                  fontSize: 14,
                  fontWeight: '700',

                }}>{jobData.designation}</Text>
              </View>
            </View>


            <View style={grid.gridItem}>
              <View style={grid.innerItem}>
                <Text style={{
                  color: '#555',
                  fontSize: 14,
                  fontWeight: '100',

                }}>বেতন পরিসীমা</Text>
                <Text style={{

                  color: '#ff1717',
                  fontSize: 14,
                  fontWeight: '700',

                }}>{jobData.salary}</Text>
              </View>
            </View>
          </View>

          <RenderHtml
            contentWidth={300}
            style={{
              marginBottom: 10,
              marginTop: 10,
              paddingTop: 10,
              paddingBottom: 10,
            }}
            source={{
              html: `${jobData.PostDetails}`,
            }}
          />
        </View>

        {/* apply button */}

        <TouchableOpacity style={{

          padding: 15,


        }}
          onPress={() => {

            //check if valid url
            const regex = new RegExp('^(http|https)://');
            const isValidUrl = regex.test(jobData.applylink);

            if (isValidUrl) {
              Linking.openURL(jobData.applylink);
            }

          }}
        >

          <View style={{
            width: '100%',
            height: 55,
            backgroundColor: '#1251c7ac',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            borderRadius: 10,
          }}>

            <FontAwesome name="hand-o-right" size={16} color="#ffffff" />
            <Text style={{
              color: '#ffffff',
              fontSize: 16,
              fontWeight: '700',
              marginLeft: 5,
            }}>আবেদন করুন</Text>


          </View>


        </TouchableOpacity>
      </ScrollView>
    );
  }
}

const grid = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  gridItem: {
    width: '50%', // 50% width for each column to create a 2-column grid

  },
  innerItem: {
    flex: 1,
    backgroundColor: '#eeeeee',
    padding: 10,
    margin: 2,
    borderRadius: 5,
  },
});

function SearchResults({ route, navigation }) {

  const { keyword, selectedLocation, selectedCategory } = route.params;

  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  const apiUrl = `https://saptahikchakrisongbad.com/api/search/?query=${keyword}&location=${selectedLocation.id}&category=${selectedCategory.id}`;
  console.log(apiUrl);


  useEffect(() => {
    // Send an API request when the component mounts
    axios.get(apiUrl)
      .then(response => {
        setSearchResults(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        setError(error);
        setIsLoading(false);
      });
  }, []);

  //if no results
  if (searchResults.length == 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <FontAwesome name="search" size={40} color="#c7c7c7" />
        <Text style={{ fontSize: 16, color: '#666', marginTop:20 }}>No results found..</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#ececeb' }}>


      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spinner />
        </View>
      ) : (


        <FlatList
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            backgroundColor: '#ececeb',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 0,
          }}
          data={searchResults}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <TouchableNativeFeedback
              backgroundColor="#fff"
              onPress={() => {
                navigation.navigate('Job', {
                  ItemCategory: item.category,
                  ItemId: item.id,
                });
              }}
            >
              <View style={styles.jobbar}>
                <View style={styles.left}>
                  <Image source={{ uri: 'https://saptahikchakrisongbad.com/admin/postimages/' + item.PostImage }} style={styles.barImage} />
                </View>
                <View style={styles.right}>
                  <Text style={styles.text}>{item.JobTitle.length > 50 ? item.JobTitle.substring(0, 50 - 3) + '...' : item.JobTitle}</Text>

                  <Text style={{
                    color: '#555',
                    marginBottom: 5,
                    fontSize: 12,
                  }}>{moment(item.PostingDate).format('MMMM Do, YYYY [at] h:mm A')}</Text>

                  <View style={{ flexDirection: 'row' }}>

                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#3ace15', padding: 5, borderRadius: 5, marginRight: 5 }}>
                      <FontAwesome name="map-marker" size={12} color="#ffffff" />
                      <Text style={{
                        color: '#ffffff', fontSize: 12, marginLeft: 5,

                      }}>{item.location}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#b40456', padding: 5, borderRadius: 5 }}>
                      <FontAwesome name="map-marker" size={12} color="#ffffff" />
                      <Text style={{
                        color: '#ffffff', fontSize: 12, marginLeft: 5,

                      }}>{item.category}</Text>
                    </View>

                  </View>



                </View>
              </View>

            </TouchableNativeFeedback>
          )}
          keyExtractor={(item, index) => index.toString()}
        />


      )}
    </View>
  );
}


const Spinner = () => (
  <View style={[styles.container, styles.horizontal]}>
    <ActivityIndicator size="large" color="#666" />
  </View>
);



const styles = StyleSheet.create({

  item: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 10,
    paddingVertical: 40,
    backgroundColor: '#ffffff',
    borderRadius: 25,
    borderColor: '#e4e4e4',
    borderWidth: 1,
  },
  icon: {
    fontSize: 24,
  },
  text: {
    fontSize: 16,
    marginTop: 10,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,

  },

  input: {
    width: '100%',
    height: 55,
    borderWidth: 1,
    borderColor: '#e6e5e5',
    borderRadius: 50,
    padding: 10,
    paddingStart: 18,
    marginBottom: 10,
    backgroundColor: '#ebebeb7d',
    marginTop: 0,
    fontSize: 16,
  },

  pickerContainer: {
    width: '100%',
    height: 55,
    borderWidth: 1,
    borderColor: '#e6e5e5',
    borderRadius: 50,
    marginBottom: 10,
    backgroundColor: '#ebebeb7d',
    marginTop: 0,
  },

  picker: {
    width: '100%',
    height: 55,
    color: '#3d3d3d',

  },

  searchButton: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: '#e6e5e5',
    marginBottom: 10,
    backgroundColor: '#1251c7ac',
    marginTop: 25,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  barImage: {
    borderRadius: 10,
    width: '100%',
    height: 110,
  },
  text: {

    fontSize: 15,
    marginTop: 10,
    marginBottom: 5,
  },

  left: {
    width: '40%',
    height: 150,
  },
  right: {
    paddingLeft: 10,
    height: 150,
    width: '60%',
  },
  jobbar: {
    padding: 10,
    maxHeight: 130,
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#fff',
    marginBottom: 5,
    shadowColor: '#999',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 0.27,
    elevation: 2,
    margin: 10,
    borderRadius: 15,
  },
  social: {
    backgroundColor: '#00000010',
    width: 35,
    height: 35,
    padding: 7.5,
    borderRadius: 50,
    marginRight: 5,
  },

  title: {
    fontSize: 20,
    marginTop: 10,
  },

  content: {
    color: '#555',
    marginTop: 10,
    fontSize: 20,
    fontWeight: '100',
  },

  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10
  },
  text: {

    fontSize: 15,
    marginTop: 10,
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    paddingHorizontal: 5,
    color: '#777',
  },
  left: {
    width: '40%',
    height: 150,
  },
  right: {
    paddingLeft: 10,
    height: 150,
    width: '60%',
  },
  jobbar: {
    padding: 10,
    maxHeight: 130,
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#fff',
    marginBottom: 5,
    shadowColor: '#999',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 0.27,
    elevation: 2,
    margin: 10,
    borderRadius: 15,
  },
});

