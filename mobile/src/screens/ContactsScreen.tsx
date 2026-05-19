import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { api } from "../api/client";
import { AppTheme } from "../theme/colors";
import { useTheme } from "../theme/useTheme";
import { getErrorMessage } from "../utils/errorMessage";

type Contact = {
  id: string;
  name: string;
  phone_number: string;
  relationship: string;
  channel: string;
};

export function ContactsScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [message, setMessage] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadContacts = async () => {
    try {
      const { data } = await api.get("/contacts");
      setContacts(data);
      setMessage("");
    } catch (error: any) {
      setMessage(getErrorMessage(error, "Could not load contacts."));
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const addContact = async () => {
    if (!name.trim() || !phone.trim() || !relationship.trim()) {
      setMessage("Fill in name, phone, and relationship before adding a contact.");
      return;
    }

    try {
      await api.post("/contacts", {
        name: name.trim(),
        phone_number: phone.trim(),
        relationship: relationship.trim(),
        channel: "sms",
      });
      setName("");
      setPhone("");
      setRelationship("");
      setMessage("Trusted contact added.");
      loadContacts();
    } catch (error: any) {
      setMessage(getErrorMessage(error, "Could not add contact."));
    }
  };

  const removeContact = async (contact: Contact) => {
    try {
      setRemovingId(contact.id);
      await api.delete(`/contacts/${contact.id}`);
      setMessage(`${contact.name} removed from trusted contacts.`);
      await loadContacts();
    } catch (error: any) {
      setMessage(getErrorMessage(error, "Could not remove contact."));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>
      <TextInput style={styles.input} placeholder="Name" placeholderTextColor={theme.textMuted} value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Phone" placeholderTextColor={theme.textMuted} value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Relationship" placeholderTextColor={theme.textMuted} value={relationship} onChangeText={setRelationship} />
      <Text style={styles.smsOnly}>Delivery mode: SMS only</Text>
      <Pressable style={styles.button} onPress={addContact}>
        <Text style={styles.buttonText}>Add Contact</Text>
      </Pressable>
      <Pressable style={[styles.button, styles.secondaryButton]} onPress={loadContacts}>
        <Text style={styles.secondaryButtonText}>Refresh Contacts</Text>
      </Pressable>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.contactCard}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactMeta}>{item.relationship} | {item.phone_number}</Text>
            <Text style={styles.contactMeta}>Channel: {item.channel}</Text>
            <Pressable
              style={[styles.removeButton, removingId === item.id && styles.removeDisabled]}
              onPress={() => removeContact(item)}
              disabled={removingId === item.id}
            >
              <Text style={styles.removeText}>
                {removingId === item.id ? "Removing..." : "Remove"}
              </Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const createStyles = (colors: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.card,
    color: colors.text,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  smsOnly: {
    color: colors.subtext,
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: colors.cardAlt,
    borderColor: colors.border,
    borderWidth: 1,
  },
  buttonText: {
    textAlign: "center",
    color: colors.buttonText,
    fontWeight: "700",
  },
  secondaryButtonText: {
    textAlign: "center",
    color: colors.text,
    fontWeight: "700",
  },
  message: {
    color: colors.subtext,
    marginBottom: 12,
  },
  contactCard: {
    backgroundColor: colors.cardAlt,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  contactName: {
    color: colors.text,
    fontWeight: "700",
  },
  contactMeta: {
    color: colors.subtext,
    marginTop: 4,
  },
  removeButton: {
    marginTop: 10,
    backgroundColor: colors.danger,
    paddingVertical: 8,
    borderRadius: 10,
  },
  removeDisabled: {
    opacity: 0.7,
  },
  removeText: {
    color: colors.buttonText,
    textAlign: "center",
    fontWeight: "700",
  },
});
