// Generate contact link with pre-filled question
export function generateContactLink(userMessage: string, productId?: string | null, sessionId?: string | null): string {
  const params = new URLSearchParams();
  params.set('subject', 'Chat Inquiry');
  params.set('details', userMessage);
  
  if (productId) {
    params.set('product', productId);
    params.set('interest', 'Product Inquiry');
  } else {
    params.set('interest', 'General Inquiry');
  }
  
  // Include session ID if available
  if (sessionId) {
    params.set('chatSessionId', sessionId);
  }
  
  return `/contact?${params.toString()}`;
}
