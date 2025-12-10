import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {useTheme} from '@context/ThemeContext';
import {Card} from '@components/Card';
import {LoadingSpinner} from '@components/LoadingSpinner';

type ProductRouteParams = {
  Product: {
    sku: string;
  };
};

export const ProductScreen: React.FC = () => {
  const {colors} = useTheme();
  const route = useRoute<RouteProp<ProductRouteParams, 'Product'>>();
  const navigation = useNavigation();
  const {sku} = route.params || {};
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    navigation.setOptions({
      title: `Product ${sku}`,
    });
  }, [sku, navigation]);

  useEffect(() => {
    // Simulate loading product data
    const loadProduct = async () => {
      setLoading(true);
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProduct({
        sku,
        name: `Product ${sku}`,
        description: `Description for product with SKU ${sku}`,
        price: '$99.99',
        inStock: true,
      });
      setLoading(false);
    };

    if (sku) {
      loadProduct();
    }
  }, [sku]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    value: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 16,
    },
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={[styles.title, {color: colors.error}]}>
            Product not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Product Details</Text>
      <Card>
        <Text style={styles.label}>SKU</Text>
        <Text style={styles.value}>{product.sku}</Text>

        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{product.name}</Text>

        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{product.description}</Text>

        <Text style={styles.label}>Price</Text>
        <Text style={styles.value}>{product.price}</Text>

        <Text style={styles.label}>In Stock</Text>
        <Text style={styles.value}>{product.inStock ? 'Yes' : 'No'}</Text>
      </Card>
    </ScrollView>
  );
};

