/**
 * BREVO Email Troubleshooting Guide
 * Use this to diagnose why emails aren't being delivered
 */

export interface BrevoAccountStatus {
  isSandbox: boolean;
  emailCredits: number;
  senderVerified: boolean;
  domainVerified: boolean;
}

export class BrevoTroubleshooter {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Check BREVO account status and configuration
   */
  async checkAccountStatus(): Promise<BrevoAccountStatus> {
    try {
      console.log('🔍 Checking BREVO account status...');
      
      // Check account details
      const accountResponse = await fetch('https://api.brevo.com/v3/account', {
        headers: {
          'api-key': this.apiKey,
          'accept': 'application/json',
        },
      });

      if (accountResponse.ok) {
        const account = await accountResponse.json();
        console.log('📊 Account Details:', {
          email: account.email,
          firstName: account.firstName,
          lastName: account.lastName,
          company: account.company,
        });
      }

      // Check SMTP status
      const smtpResponse = await fetch('https://api.brevo.com/v3/smtp/status', {
        headers: {
          'api-key': this.apiKey,
          'accept': 'application/json',
        },
      });

      if (smtpResponse.ok) {
        const smtpStatus = await smtpResponse.json();
        console.log('📧 SMTP Status:', smtpStatus);
        return {
          isSandbox: smtpStatus.sandbox || false,
          emailCredits: smtpStatus.credits || 0,
          senderVerified: smtpStatus.sender_verified || false,
          domainVerified: smtpStatus.domain_verified || false,
        };
      }

      throw new Error('Failed to check account status');
    } catch (error) {
      console.error('❌ Error checking BREVO account:', error);
      return {
        isSandbox: true, // Assume sandbox if we can't check
        emailCredits: 0,
        senderVerified: false,
        domainVerified: false,
      };
    }
  }

  /**
   * Send a test email to verify configuration
   */
  async sendTestEmail(toEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📧 Sending test email to:', toEmail);
      
      const testEmailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>BREVO Test Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>🧪 BREVO Test Email</h2>
          <p>This is a test email from Mimasa Foods to verify BREVO configuration.</p>
          <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>To:</strong> ${toEmail}</p>
          <p><strong>From:</strong> mimasafoods@gmail.com</p>
          <hr>
          <p>If you receive this email, BREVO is working correctly!</p>
        </body>
        </html>
      `;

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': this.apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: 'Mimasa Foods Test',
            email: 'mimasafoods@gmail.com',
          },
          to: [
            {
              email: toEmail,
              name: 'Test Recipient',
            },
          ],
          subject: '🧪 BREVO Test Email - Mimasa Foods',
          htmlContent: testEmailContent,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Test email sent successfully:', result);
        return { success: true };
      } else {
        console.error('❌ Test email failed:', result);
        return { 
          success: false, 
          error: `BREVO Error: ${result.message || 'Unknown error'}` 
        };
      }
    } catch (error) {
      console.error('❌ Error sending test email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send test email' 
      };
    }
  }

  /**
   * Print troubleshooting checklist
   */
  static printTroubleshootingChecklist(): void {
    console.log(`
🚨 BREVO EMAIL TROUBLESHOOTING CHECKLIST
======================================

1️⃣  ACCOUNT STATUS CHECK:
   • Are you in sandbox mode? (Sandbox emails don't deliver to real addresses)
   • Do you have email credits available?
   • Is your sender email verified?

2️⃣  SENDER CONFIGURATION:
   • Is mimasafoods@gmail.com verified as a sender in BREVO?
   • Have you added SPF/DKIM records for your domain?
   • Is the sender email not blocked?

3️⃣  API KEY ISSUES:
   • Are you using the correct API key (v3 SMTP API key)?
   • Does the API key have SMTP permissions?
   • Is the API key active and not expired?

4️⃣  EMAIL CONTENT:
   • Is the HTML content valid?
   • Are there any spam trigger words?
   • Is the subject line appropriate?

5️⃣  RECIPIENT ISSUES:
   • Are the recipient email addresses valid?
   • Are they being blocked by spam filters?
   • Check spam/junk folders?

6️⃣  BREVO DASHBOARD:
   • Check your BREVO dashboard for email logs
   • Look for delivery status and error messages
   • Verify account is in good standing

🔧 QUICK FIXES:
• If in sandbox mode: Upgrade to production account
• If sender not verified: Verify mimasafoods@gmail.com in BREVO
• If no credits: Purchase email credits
• If API key issues: Generate new v3 SMTP API key

📞 BREVO SUPPORT: https://www.brevo.com/support/
`);
  }
}

// Auto-print checklist when imported
BrevoTroubleshooter.printTroubleshootingChecklist();
