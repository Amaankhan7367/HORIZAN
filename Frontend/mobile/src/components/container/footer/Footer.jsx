import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

function Footer() {
  const productLinks = [
    'Features',
    'Pricing',
    'Case Studies',
    'Reviews',
  ];

  const resourceLinks = [
    'Blog',
    'Help Center',
    'Contact Us',
    'Status',
  ];

  const companyLinks = [
    'About Us',
    'Careers',
    'Press',
  ];

  return (
    <View style={styles.footer}>
      <View style={styles.container}>

        {/* Brand */}
        <View style={styles.brandSection}>
          <TouchableOpacity>
            <Text style={styles.logo}>YOUR BRAND</Text>
          </TouchableOpacity>

          <Text style={styles.description}>
            A sleek and modern footer for businesses
            that want to make a bold statement.
          </Text>
        </View>

        {/* Product */}
        <View style={styles.linkSection}>
          <Text style={styles.heading}>PRODUCT</Text>

          {productLinks.map((item) => (
            <TouchableOpacity key={item}>
              <Text style={styles.link}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Resources */}
        <View style={styles.linkSection}>
          <Text style={styles.heading}>RESOURCES</Text>

          {resourceLinks.map((item) => (
            <TouchableOpacity key={item}>
              <Text style={styles.link}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Company */}
        <View style={styles.linkSection}>
          <Text style={styles.heading}>COMPANY</Text>

          {companyLinks.map((item) => (
            <TouchableOpacity key={item}>
              <Text style={styles.link}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom */}
        <View style={styles.bottom}>
          <Text style={styles.copyright}>
            © 2026 Your Brand. All Rights Reserved.
          </Text>

          <View style={styles.social}>
            <TouchableOpacity>
              <Text style={styles.socialText}>Twitter</Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text style={styles.socialText}>GitHub</Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text style={styles.socialText}>LinkedIn</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    backgroundColor: '#121212',
    paddingTop: 40,
    paddingBottom: 25,
  },

  container: {
    width: '100%',
    paddingHorizontal: 20,
  },

  brandSection: {
    marginBottom: 35,
  },

  logo: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 15,
  },

  description: {
    color: '#a0a0a0',
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 350,
  },

  linkSection: {
    marginBottom: 30,
  },

  heading: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 15,
  },

  link: {
    color: '#a0a0a0',
    fontSize: 14,
    marginBottom: 12,
  },

  bottom: {
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    paddingTop: 20,
    alignItems: 'center',
    gap: 18,
  },

  copyright: {
    color: '#a0a0a0',
    fontSize: 12,
    textAlign: 'center',
  },

  social: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },

  socialText: {
    color: '#a0a0a0',
    fontSize: 13,
  },
});

export default Footer;