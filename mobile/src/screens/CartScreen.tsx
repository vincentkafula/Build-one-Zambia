import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useCart } from '../lib/CartContext';
import { shopApi } from '../lib/api';
import { useAuth } from '../lib/AuthContext';

const GREEN = '#007A30';

export default function CartScreen() {
  const { items, removeItem, updateQty, total, clear } = useCart();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Missing details', 'Please fill in your name, email, phone, and delivery address.');
      return;
    }
    setSubmitting(true);
    try {
      const order = await shopApi.createOrder({
        items: items.map(i => ({ productId: Math.floor(i.id / 100), name: i.name, qty: i.qty, priceNum: i.priceNum, colour: i.colour })),
        total,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        deliveryAddress: address.trim(),
        paymentMethod: 'mobile_money',
      });
      await shopApi.initiatePayment({ orderId: order.order.id, method: 'mobile_money', amount: total, phone: phone.trim() });
      Alert.alert(
        'Order placed',
        `Order #${order.order.id} has been created. You'll be contacted to complete payment and arrange delivery.`
      );
      clear();
    } catch (e) {
      Alert.alert('Checkout failed', e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <FlatList
        data={items}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>K{item.priceNum} × {item.qty}</Text>
            </View>
            <View style={styles.qtyControls}>
              <TouchableOpacity onPress={() => updateQty(item.id, item.qty - 1)} style={styles.qtyBtn}><Text>−</Text></TouchableOpacity>
              <Text style={styles.qtyText}>{item.qty}</Text>
              <TouchableOpacity onPress={() => updateQty(item.id, item.qty + 1)} style={styles.qtyBtn}><Text>+</Text></TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => removeItem(item.id)}><Text style={styles.remove}>Remove</Text></TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.checkoutForm}>
            <Text style={styles.total}>Total: K{total.toLocaleString()}</Text>
            <TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Phone (for mobile money)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Delivery address" value={address} onChangeText={setAddress} multiline />
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.checkoutButtonText}>Place Order</Text>}
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#6b7280', fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#f0f0f0' },
  itemName: { fontWeight: '600', color: '#111827' },
  itemPrice: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: 12 },
  qtyBtn: { width: 26, height: 26, borderRadius: 6, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  qtyText: { minWidth: 18, textAlign: 'center' },
  remove: { color: '#dc2626', fontSize: 12 },
  checkoutForm: { marginTop: 16, backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#f0f0f0' },
  total: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#111827' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, fontSize: 14 },
  checkoutButton: { backgroundColor: GREEN, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  checkoutButtonText: { color: '#fff', fontWeight: '700' },
});
