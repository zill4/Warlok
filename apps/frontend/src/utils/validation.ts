/**
 * Validation utilities for form inputs
 */

/**
 * Validates asset name
 * @param name The asset name to validate
 * @returns An object with isValid and message properties
 */
export function validateAssetName(name: string): { isValid: boolean; message: string } {
  if (!name || name.trim() === '') {
    return { isValid: false, message: 'Asset name is required' };
  }
  
  if (name.length > 50) {
    return { isValid: false, message: 'Asset name must be 50 characters or less' };
  }
  
  // Check for valid characters (alphanumeric, spaces, and basic punctuation)
  const validNameRegex = /^[a-zA-Z0-9\s\-_.,!?'":;()]+$/;
  if (!validNameRegex.test(name)) {
    return { isValid: false, message: 'Asset name contains invalid characters' };
  }
  
  return { isValid: true, message: '' };
}

/**
 * Validates royalty rate
 * @param rate The royalty rate to validate
 * @returns An object with isValid, message, and value properties
 */
export function validateRoyaltyRate(rate: string): { isValid: boolean; message: string; value: string } {
  if (!rate || rate.trim() === '') {
    return { isValid: false, message: 'Royalty rate is required', value: '10%' };
  }
  
  // Remove % and any non-numeric characters
  const numericValue = parseFloat(rate.replace(/[^0-9.]/g, ''));
  
  if (isNaN(numericValue)) {
    return { isValid: false, message: 'Royalty rate must be a number', value: '10%' };
  }
  
  // Limit royalty rate to a reasonable range (0-30%)
  if (numericValue < 0) {
    return { isValid: false, message: 'Royalty rate cannot be negative', value: '0%' };
  }
  
  if (numericValue > 30) {
    return { isValid: false, message: 'Maximum royalty rate is 30%', value: '30%' };
  }
  
  return { isValid: true, message: '', value: `${numericValue}%` };
}

/**
 * Validates asset price
 * @param price The price to validate
 * @returns An object with isValid, message, and value properties
 */
export function validateAssetPrice(price: string): { isValid: boolean; message: string; value: string } {
  if (!price || price.trim() === '') {
    return { isValid: false, message: 'Price is required', value: 'FREE' };
  }
  
  // Check if it's "FREE"
  if (price.trim().toLowerCase() === 'free') {
    return { isValid: true, message: '', value: 'FREE' };
  }
  
  // Remove $ and any non-numeric characters
  const numericValue = parseFloat(price.replace(/[^0-9.]/g, ''));
  
  if (isNaN(numericValue)) {
    return { isValid: false, message: 'Price must be a number or FREE', value: 'FREE' };
  }
  
  // Limit price to a reasonable range (0-1.00)
  if (numericValue < 0) {
    return { isValid: false, message: 'Price cannot be negative', value: 'FREE' };
  }
  
  if (numericValue > 1.00) {
    return { isValid: false, message: 'Maximum price is $1.00', value: '$1.00' };
  }
  
  return { isValid: true, message: '', value: `$${numericValue.toFixed(2)}` };
}

/**
 * Validates asset tags
 * @param tags The tags to validate
 * @returns An object with isValid and message properties
 */
export function validateAssetTags(tags: string): { isValid: boolean; message: string } {
  if (!tags || tags.trim() === '') {
    return { isValid: true, message: '' }; // Tags are optional
  }
  
  // Check if tags are too long
  if (tags.length > 200) {
    return { isValid: false, message: 'Tags must be 200 characters or less' };
  }
  
  return { isValid: true, message: '' };
} 