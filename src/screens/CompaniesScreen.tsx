import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import {Company, FilterType} from '@types/index';
import {companiesService} from '@services/companiesService';
import {Card} from '@components/Card';
import {Button} from '@components/Button';
import {LoadingSpinner} from '@components/LoadingSpinner';
import {Modal} from '@components/Modal';
import {Input} from '@components/Input';

export const CompaniesScreen: React.FC = () => {
  const {colors} = useTheme();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showModal, setShowModal] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    taxId: '',
    email: '',
    phone: '',
  });

  const loadCompanies = async () => {
    try {
      const data = await companiesService.getAll();
      setCompanies(data);
      applyFilter(data, filter);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    applyFilter(companies, filter);
  }, [filter]);

  const applyFilter = (data: Company[], currentFilter: FilterType) => {
    // TODO: Implement actual filtering logic based on reminders
    setFilteredCompanies(data);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCompanies();
  };

  const handleCreateCompany = async () => {
    try {
      await companiesService.create(newCompany);
      setShowModal(false);
      setNewCompany({name: '', taxId: '', email: '', phone: ''});
      loadCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: colors.text}]}>Companies</Text>
        <Button
          title="+ New"
          onPress={() => setShowModal(true)}
          variant="primary"
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {filteredCompanies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
              No companies registered
            </Text>
          </View>
        ) : (
          filteredCompanies.map(company => (
            <Card key={company.id}>
              <Text style={[styles.companyName, {color: colors.text}]}>
                {company.name}
              </Text>
              {company.taxId && (
                <Text style={[styles.companyInfo, {color: colors.textSecondary}]}>
                  Tax ID: {company.taxId}
                </Text>
              )}
              {company.email && (
                <Text style={[styles.companyInfo, {color: colors.textSecondary}]}>
                  {company.email}
                </Text>
              )}
            </Card>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="New Company">
        <Input
          label="Name"
          placeholder="Company name"
          value={newCompany.name}
          onChangeText={text => setNewCompany({...newCompany, name: text})}
        />
        <Input
          label="Tax ID"
          placeholder="123456789"
          value={newCompany.taxId}
          onChangeText={text => setNewCompany({...newCompany, taxId: text})}
        />
        <Input
          label="Email"
          placeholder="contact@company.com"
          value={newCompany.email}
          onChangeText={text => setNewCompany({...newCompany, email: text})}
          keyboardType="email-address"
        />
        <Input
          label="Phone"
          placeholder="+1 234 567 8900"
          value={newCompany.phone}
          onChangeText={text => setNewCompany({...newCompany, phone: text})}
          keyboardType="phone-pad"
        />
        <Button
          title="Create Company"
          onPress={handleCreateCompany}
          fullWidth
          style={styles.modalButton}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  companyInfo: {
    fontSize: 14,
    marginTop: 4,
  },
  modalButton: {
    marginTop: 16,
  },
});

