import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { API_URL } from "@env"; // si usas react-native-dotenv

export default function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/ruta-del-endpoint`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.log(err));
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{data ? JSON.stringify(data) : "Cargando..."}</Text>
    </View>
  );
}
