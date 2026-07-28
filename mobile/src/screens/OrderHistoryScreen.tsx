import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { myOrdersApi, ShopOrder, ShopPayment } from '../lib/api';

const GREEN = '#007A30';

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [payments, setPayments] = useState<ShopPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnReason, setReturnReason] = useState<Record<string, string>>({});
  const [submittingReturn, setSubmittingReturn] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    myOrdersApi.list()
      .then(res => { setOrders(res.orders); setPayments(res.payments); })
      .catch(() => { setOrders([]); setPayments([]); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const requestReturn = async (orderId: string) => {
    const reason = returnReason[orderId]?.trim();
    if (!reason) {
      Alert.alert('Reason required', 'Please describe why you\u2019re requesting a return.');
      return;
    }
    setSubmittingReturn(orderId);
    try {
      await myOrdersApi.requestReturn(orderId, reason);
      Alert.alert('Return requested', 'Your return request has been submitted.');
      load();
    } catch (e) {
      Alert.alert('Could not submit', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSubmittingReturn(null);
    }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator color={GREEN} size="large" /></View>;

  return (
    <FlatList
      style={{ backgroundColor: '#f9fafb' }}
      data={orders}
      keyExtractor={o => o.id}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No orders yet.</Text>
        </View>
      }
      renderItem={({ item }) => {
        const payment = payments.find(p => p.orderId === item.id);
        const canReturn = item.status === 'delivered' || item.status === 'completed';
        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>{item.id}</Text>
              <View style={[styles.statusPill, statusStyle(item.status)]}>
                <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.orderDate}>{new Date(item.submittedAt).toLocaleDateString('en-ZM')}</Text>

            {item.items.map((it, i) => (
              <Text key={i} style={styles.itemLine}>
                {it.qty}\u00d7 {it.name || 'Item'} {it.priceNum ? `\u2014 K${it.priceNum}` : ''}
              </Text>
            ))}

            <View style={styles.footerRow}>
              <Text style={styles.total}>Total: K{item.total.toLocaleString()}</Text>
              {payment && <Text style={styles.paymentStatus}>Payment: {payment.status}</Text>}
            </View>

            {canReturn && (
              <View style={styles.returnBox}>
                <TextInput
                  style={styles.returnInput}
                  placeholder="Reason for return"
                  value={returnReason[item.id] || ''}
                  onChangeText={t => setReturnReason(prev => ({ ...prev, [item.id]: t }))}
                />
                <TouchableOpacity
                  style={styles.returnButton}
                  onPress={() => requestReturn(item.id)}
                  disabled={submittingReturn === item.id}
                >
                  {submittingReturn === item.id ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.returnButtonText}>Request Return</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      }}
    />
  );
}

function statusStyle(status: string) {
  if (status === 'delivered' || status === 'completed') return { backgroundColor: '#dcfce7' };
  if (status === 'cancelled' || status === 'rejected') return { backgroundColor: '#fee2e2' };
  return { backgroundColor: '#fef3c7' };
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' },
  emptyCard: { alignItems: 'center', paddingVertical: 40, borderWidth: 1, borderColor: '#e5e7eb', borderStyle: 'dashed', borderRadius: 12 },
  emptyText: { color: '#6b7280', fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontFamily: 'monospace' as any, fontWeight: '700', color: GREEN, fontSize: 13 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  statusText: { fontSize: 9, fontWeight: '700', color: '#374151', letterSpacing: 0.5 },
  orderDate: { fontSize: 11, color: '#9ca3af', marginTop: 2, marginBottom: 8 },
  itemLine: { fontSize: 12, color: '#374151', paddingVertical: 1 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  total: { fontWeight: '700', color: '#111827', fontSize: 13 },
  paymentStatus: { fontSize: 11, color: '#6b7280' },
  returnBox: { marginTop: 10, gap: 8 },
  returnInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12 },
  returnButton: { backgroundColor: '#dc2626', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  returnButtonText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
