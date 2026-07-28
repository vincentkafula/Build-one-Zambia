import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { PRODUCTS, Product } from '../lib/products';
import { useCart } from '../lib/CartContext';
import { useNavigation } from '@react-navigation/native';

const GREEN = '#007A30';
const ORANGE = '#EC6D01';

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selected, setSelected] = useState<number | null>(null);

  const handleAdd = () => {
    if (selected === null) {
      Alert.alert('Select a colour', 'Please choose a colour before adding this item to your cart.');
      return;
    }
    addItem(product, selected);
    Alert.alert('Added to cart', `${product.name} \u2014 ${product.colors[selected].name}`);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.desc} numberOfLines={2}>{product.desc}</Text>
      <Text style={styles.price}>{product.price}</Text>

      <View style={styles.swatchRow}>
        {product.colors.map((c, i) => (
          <TouchableOpacity
            key={c.name}
            onPress={() => setSelected(i)}
            style={[
              styles.swatch,
              { backgroundColor: c.swatch },
              selected === i && styles.swatchSelected,
            ]}
          />
        ))}
      </View>
      <Text style={styles.colourLabel}>{selected !== null ? `Colour: ${product.colors[selected].name}` : 'Select a colour'}</Text>

      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ShopScreen() {
  const navigation = useNavigation<any>();
  const { items } = useCart();
  const cartCount = items.reduce((s, i) => s + i.qty, 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <TouchableOpacity style={styles.cartBar} onPress={() => navigation.navigate('Cart')}>
        <Text style={styles.cartBarText}>View Cart ({cartCount})</Text>
      </TouchableOpacity>
      <FlatList
        data={PRODUCTS}
        keyExtractor={p => String(p.id)}
        renderItem={({ item }) => <ProductCard product={item} />}
        contentContainerStyle={{ padding: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cartBar: { backgroundColor: ORANGE, paddingVertical: 12, alignItems: 'center' },
  cartBarText: { color: '#fff', fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  name: { fontSize: 16, fontWeight: '700', color: '#111827' },
  desc: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  price: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 8 },
  swatchRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  swatch: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(0,0,0,0.2)' },
  swatchSelected: { borderWidth: 2, borderColor: '#111827' },
  colourLabel: { fontSize: 12, color: '#6b7280', marginTop: 6 },
  addButton: { backgroundColor: GREEN, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 14 },
  addButtonText: { color: '#fff', fontWeight: '700' },
});
