import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

/**
 * ErrorBoundary.js - Error boundary component
 * 
 * Adapted from web ErrorBoundary
 * - Catches JavaScript errors in child components
 * - Displays error UI instead of white screen
 * - Can restart app
 * - Logs errors for debugging
 */

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error Boundary caught error:', error);
    console.error('Error Info:', errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#fafaf8', paddingHorizontal: 24 }}>
          <ScrollView contentContainerStyle={{ paddingVertical: 24 }}>
            <View style={{ marginBottom: 24, marginTop: 40 }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '700',
                  color: '#1c1917',
                  marginBottom: 12,
                }}
              >
                Oops! Something went wrong
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: '#78716c',
                  lineHeight: 20,
                }}
              >
                The app encountered an unexpected error. Please try restarting.
              </Text>
            </View>

            {/* Error Details (only in development) */}
            {__DEV__ && this.state.error && (
              <View
                style={{
                  backgroundColor: '#fff',
                  borderLeftWidth: 4,
                  borderLeftColor: '#d62828',
                  padding: 16,
                  marginBottom: 24,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: '#d62828',
                    marginBottom: 8,
                  }}
                >
                  Error Details (Dev Only):
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#1c1917',
                    fontFamily: 'Courier New',
                    lineHeight: 16,
                  }}
                >
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text
                    style={{
                      fontSize: 11,
                      color: '#78716c',
                      marginTop: 12,
                      fontFamily: 'Courier New',
                      lineHeight: 14,
                    }}
                  >
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            {/* Action Buttons */}
            <TouchableOpacity
              onPress={this.resetError}
              style={{
                backgroundColor: '#2d6a4f',
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                Try Again
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}
