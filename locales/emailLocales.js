/**
 * Email Locales Module
 *
 * This module provides multi-language support for all transactional emails.
 * Supported languages: EN (English), PT (Portuguese), IT (Italian), ES (Spanish),
 * FR (French), DE (German), HI (Hindi)
 *
 * Each email type contains:
 * - subject: Email subject line with variable placeholders
 * - greeting: Personalized greeting
 * - body: Main email body text
 * - cta: Call-to-action button text
 * - footer: Standard footer text
 *
 * Variable placeholders use double curly braces: {{variable_name}}
 */

export const emailLocales = {
  en: {
    // Signing invitation email
    inviteToSign: {
      subject: '{{sender_name}} has requested you to sign "{{document_title}}"',
      header: 'Digital Signature Request',
      intro:
        '{{sender_name}} has requested you to review and sign <strong>{{document_title}}</strong>.',
      senderLabel: 'Sender',
      organizationLabel: 'Organization',
      expiresLabel: 'Expires on',
      noteLabel: 'Note',
      ctaText: 'Sign here',
      footer:
        'This is an automated email from {{app_name}}. For any queries regarding this email, please contact the sender {{sender_email}} directly. If you think this email is inappropriate or spam, you may file a complaint with {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    // Document signed notification (to creator)
    documentSigned: {
      subject: 'Document "{{document_title}}" has been signed by {{signer_name}}',
      header: 'Document signed by {{signer_name}}',
      greeting: 'Dear {{creator_name}},',
      body: '{{document_title}} has been signed by {{signer_name}} "{{signer_email}}" successfully',
      viewDocument: 'View Document',
      footer:
        'This is an automated email from {{app_name}}. For any queries regarding this email, please contact the sender {{creator_email}} directly. If you think this email is inappropriate or spam, you may file a complaint with {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    // Document completed (all parties signed)
    documentCompleted: {
      subject: 'Document "{{document_title}}" has been signed by all parties',
      header: 'Document signed successfully',
      body: 'All parties have successfully signed the document <b>"{{document_title}}"</b>. Kindly download the document from the attachment.',
      completionTitle: 'Process completed!',
      completionSubtitle: 'All signatures have been collected',
      attachmentInfo:
        '<strong>📎 Attached document:</strong> The document signed by all parties is attached to this email. Download the file for your records.',
      footer:
        'This is an automated email from {{app_name}}. For any queries regarding this email, please contact the sender {{sender_email}} directly. If you think this email is inappropriate or spam, you may file a complaint with {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    // Password reset email
    resetPassword: {
      subject: 'Reset your password for {{app_name}}',
      greeting: 'Hello!',
      body: 'You requested to reset the password for your account:',
      instruction: 'Click the button below to reset your password:',
      ctaText: 'Reset Password',
      footer: 'If you did not request this password reset, please ignore this email.',
    },
    // Email verification
    emailVerification: {
      subject: 'Verify your email for {{app_name}}',
      greeting: 'Hello!',
      body: 'Please verify your email address for:',
      instruction: 'Click the button below to verify your email:',
      ctaText: 'Verify email',
      footer: 'If you did not create an account, please ignore this email.',
    },
    // OTP verification email
    otpVerification: {
      subject: 'Your {{app_name}} OTP',
      header: 'OTP Verification',
      body: 'Your OTP for {{app_name}} verification is:',
      footer: 'This code will expire in 10 minutes. Do not share this code with anyone.',
    },
    // Account deletion request
    accountDeletion: {
      subject: 'Account Deletion Request for {{username}} – {{app_name}}',
      greeting: 'Hello Administrator,',
      body: 'A user has requested account deletion:',
      userLabel: 'User',
      instruction: 'Click the button below to process this request:',
      ctaText: 'Process Deletion',
      footer: 'This is an automated notification from {{app_name}}.',
    },
    // Document forwarding
    forwardDocument: {
      subject: '{{sender_name}} has signed the doc - {{document_title}}',
      header: 'Document Copy',
      greeting: 'Hello,',
      body: '{{sender_name}} has shared a signed document with you.',
      documentLabel: 'Signed Document',
      attachmentInfo:
        '<strong>📎 Attached document:</strong> The signed document is attached to this email. Download the file for your records.',
      footer:
        'This is an automated email from {{app_name}}. For any queries regarding this email, please contact the sender {{sender_email}} directly. If you think this email is inappropriate or spam, you may file a complaint with {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    // Account deletion OTP
    deletionOtp: {
      subject: 'Account Deletion OTP - {{app_name}}',
      header: 'Account Deletion Verification',
      greeting: 'Hello {{username}},',
      body: 'You have requested to delete your account. Your verification code is:',
      footer:
        'This code will expire in 10 minutes. If you did not request this, please secure your account immediately.',
    },
    // Welcome new user email
    welcomeUser: {
      subject: 'Welcome! Your account has been created',
      title: 'Welcome to {{app_name}}!',
      message: 'Your account has been successfully created. Below are your access credentials:',
      emailLabel: 'Email',
      passwordLabel: 'Temporary Password',
      securityWarning:
        'For security reasons, we recommend changing your password after your first login.',
      loginButton: 'Access the Platform',
      additionalInfo:
        'If you have any questions or need help, please contact your administrator or our support team.',
      footerText: 'Please do not reply to this email. This is an automated message.',
      autoEmailText: 'This email was sent automatically by the system.',
    },
    // Certificate of Completion
    certificate: {
      generatedOn: 'Generated On',
      title: 'Certificate of Completion',
      summary: 'Summary',
      documentId: 'Document Id :',
      documentName: 'Subject :',
      organization: 'Organization :',
      createdOn: 'Created on :',
      completedOn: 'Completed on :',
      signers: 'Signers :',
      documentHash: 'Document SHA-256 Hash :',
      documentOriginator: 'Envelope Sender',
      envelopeSender: 'Envelope Sender',
      status: 'Status',
      sent: 'Sent',
      name: 'Name :',
      email: 'Email :',
      ipAddress: 'IP address :',
      plant: 'Plant :',
      legalName: 'Legal Name :',
      cnpj: 'CNPJ :',
      address: 'Address :',
      contactEmail: 'Contact Email :',
      contactPhone: 'Contact Phone :',
      signer: 'Signer',
      securityLevel: 'Security level :',
      emailOtpAuth: 'Email, OTP Auth',
      viewedOn: 'Viewed on :',
      signedOn: 'Signed on :',
      signature: 'Signature :',
      signerEvents: 'Signer Events',
      signatureColumn: 'Signature',
      timestampColumn: 'Timestamp',
    },
  },
  'pt-BR': {
    // E-mail de boas-vindas para novo usuário
    welcomeUser: {
      subject: 'Bem-vindo! Sua conta foi criada',
      title: 'Bem-vindo ao {{app_name}}!',
      message: 'Sua conta foi criada com sucesso. Abaixo estão suas credenciais de acesso:',
      emailLabel: 'E-mail',
      passwordLabel: 'Senha Temporária',
      securityWarning:
        'Por motivos de segurança, recomendamos que você altere sua senha após o primeiro acesso.',
      loginButton: 'Acessar a Plataforma',
      additionalInfo:
        'Se você tiver alguma dúvida ou precisar de ajuda, entre em contato com seu administrador ou nossa equipe de suporte.',
      footerText: 'Por favor, não responda a este e-mail. Esta é uma mensagem automática.',
      autoEmailText: 'Este e-mail foi enviado automaticamente pelo sistema.',
    },
    // E-mail de convite para assinatura
    inviteToSign: {
      subject: '{{sender_name}} solicitou sua assinatura em "{{document_title}}"',
      header: 'Solicitação de Assinatura Digital',
      intro:
        '{{sender_name}} solicitou que você revise e assine <strong>{{document_title}}</strong>.',
      senderLabel: 'Remetente',
      organizationLabel: 'Organização',
      expiresLabel: 'Expira em',
      noteLabel: 'Observação',
      ctaText: 'Assinar aqui',
      footer:
        'Este é um e-mail automático do {{app_name}}. Para quaisquer dúvidas sobre este e-mail, entre em contato diretamente com o remetente {{sender_email}}. Se você acha que este e-mail é inadequado ou spam, pode registrar uma reclamação com {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    // Notificação de documento assinado (para o criador)
    documentSigned: {
      subject: 'Documento "{{document_title}}" foi assinado por {{signer_name}}',
      header: 'Documento assinado por {{signer_name}}',
      greeting: 'Prezado(a) {{creator_name}},',
      body: '{{document_title}} foi assinado por {{signer_name}} "{{signer_email}}" com sucesso',
      viewDocument: 'Ver Documento',
      footer:
        'Este é um e-mail automático do {{app_name}}. Para quaisquer dúvidas sobre este e-mail, entre em contato diretamente com o remetente {{creator_email}}. Se você acha que este e-mail é inadequado ou spam, pode registrar uma reclamação com {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    // Documento completo (todas as partes assinaram)
    documentCompleted: {
      subject: 'Documento "{{document_title}}" foi assinado por todas as partes',
      header: 'Documento assinado com sucesso',
      body: 'Todas as partes assinaram com sucesso o documento <b>"{{document_title}}"</b>. Por favor, baixe o documento do anexo.',
      completionTitle: 'Processo concluído!',
      completionSubtitle: 'Todas as assinaturas foram coletadas',
      attachmentInfo:
        '<strong>📎 Documento anexado:</strong> O documento assinado por todas as partes está anexado a este e-mail. Baixe o arquivo para seus registros.',
      footer:
        'Este é um e-mail automático do {{app_name}}. Para quaisquer dúvidas sobre este e-mail, entre em contato diretamente com o remetente {{sender_email}}. Se você acha que este e-mail é inadequado ou spam, pode registrar uma reclamação com {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    // Redefinição de senha
    resetPassword: {
      subject: 'Redefina sua senha para {{app_name}}',
      greeting: 'Olá!',
      body: 'Você solicitou a redefinição de senha da sua conta:',
      instruction: 'Clique no botão abaixo para redefinir sua senha:',
      ctaText: 'Verificar e-mail',
      footer: 'Se você não solicitou esta redefinição de senha, ignore este e-mail.',
    },
    // Verificação de e-mail
    emailVerification: {
      subject: 'Verifique seu e-mail para {{app_name}}',
      greeting: 'Olá!',
      body: 'Por favor, verifique seu endereço de e-mail para:',
      instruction: 'Clique no botão abaixo para verificar seu e-mail:',
      ctaText: 'Verificar e-mail',
      footer: 'Se você não criou uma conta, ignore este e-mail.',
    },
    // E-mail de verificação OTP
    otpVerification: {
      subject: 'Seu OTP do {{app_name}}',
      header: 'Verificação OTP',
      body: 'Seu OTP para verificação do {{app_name}} é:',
      footer: 'Este código expirará em 10 minutos. Não compartilhe este código com ninguém.',
    },
    // Solicitação de exclusão de conta
    accountDeletion: {
      subject: 'Solicitação de Exclusão de Conta para {{username}} – {{app_name}}',
      greeting: 'Olá Administrador,',
      body: 'Um usuário solicitou a exclusão da conta:',
      userLabel: 'Usuário',
      instruction: 'Clique no botão abaixo para processar esta solicitação:',
      ctaText: 'Processar Exclusão',
      footer: 'Esta é uma notificação automática do {{app_name}}.',
    },
    // Encaminhamento de documento
    forwardDocument: {
      subject: '{{sender_name}} assinou o doc - {{document_title}}',
      header: 'Cópia do Documento',
      greeting: 'Olá,',
      body: '{{sender_name}} compartilhou um documento assinado com você.',
      documentLabel: 'Documento Assinado',
      attachmentInfo:
        '<strong>📎 Documento anexado:</strong> O documento assinado está anexado a este e-mail. Baixe o arquivo para seus registros.',
      footer:
        'Este é um e-mail automático do {{app_name}}. Para quaisquer dúvidas sobre este e-mail, entre em contato diretamente com o remetente {{sender_email}}. Se você acha que este e-mail é inadequado ou spam, pode registrar uma reclamação com {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    // OTP de exclusão de conta
    deletionOtp: {
      subject: 'OTP de Exclusão de Conta - {{app_name}}',
      header: 'Verificação de Exclusão de Conta',
      greeting: 'Olá {{username}},',
      body: 'Você solicitou excluir sua conta. Seu código de verificação é:',
      footer:
        'Este código expirará em 10 minutos. Se você não solicitou isso, proteja sua conta imediatamente.',
    },
    // Certificado de Conclusão
    certificate: {
      generatedOn: 'Gerado em',
      title: 'Certificado de Conclusão',
      summary: 'Resumo',
      documentId: 'ID do Documento :',
      documentName: 'Assunto :',
      organization: 'Organização :',
      createdOn: 'Criado em :',
      completedOn: 'Concluído em :',
      signers: 'Signatários :',
      documentHash: 'Hash SHA-256 do Documento :',
      documentOriginator: 'Remetente do envelope',
      envelopeSender: 'Remetente do envelope',
      status: 'Status',
      sent: 'Enviado',
      name: 'Nome :',
      email: 'E-mail :',
      ipAddress: 'Endereço IP :',
      plant: 'Planta :',
      legalName: 'Razão Social :',
      cnpj: 'CNPJ :',
      address: 'Endereço :',
      contactEmail: 'E-mail de Contato :',
      contactPhone: 'Telefone de Contato :',
      signer: 'Signatário',
      securityLevel: 'Nível de segurança :',
      emailOtpAuth: 'E-mail, Autenticação OTP',
      viewedOn: 'Visualizado em :',
      signedOn: 'Assinado em :',
      signature: 'Assinatura :',
      signerEvents: 'Eventos do signatário',
      signatureColumn: 'Assinatura',
      timestampColumn: 'Registro de hora e data',
    },
  },
  pt: {
    // Alias for pt-BR (Portuguese)
    // E-mail de boas-vindas para novo usuário
    welcomeUser: {
      subject: 'Bem-vindo! Sua conta foi criada',
      title: 'Bem-vindo ao {{app_name}}!',
      message: 'Sua conta foi criada com sucesso. Abaixo estão suas credenciais de acesso:',
      emailLabel: 'E-mail',
      passwordLabel: 'Senha Temporária',
      securityWarning:
        'Por motivos de segurança, recomendamos que você altere sua senha após o primeiro acesso.',
      loginButton: 'Acessar a Plataforma',
      additionalInfo:
        'Se você tiver alguma dúvida ou precisar de ajuda, entre em contato com seu administrador ou nossa equipe de suporte.',
      footerText: 'Por favor, não responda a este e-mail. Esta é uma mensagem automática.',
      autoEmailText: 'Este e-mail foi enviado automaticamente pelo sistema.',
    },
    inviteToSign: {
      subject: '{{sender_name}} solicitou sua assinatura em "{{document_title}}"',
      header: 'Solicitação de Assinatura Digital',
      intro:
        '{{sender_name}} solicitou que você revise e assine <strong>{{document_title}}</strong>.',
      senderLabel: 'Remetente',
      organizationLabel: 'Organização',
      expiresLabel: 'Expira em',
      noteLabel: 'Observação',
      ctaText: 'Assinar aqui',
      footer:
        'Este é um e-mail automático do {{app_name}}. Para quaisquer dúvidas sobre este e-mail, entre em contato diretamente com o remetente {{sender_email}}. Se você acha que este e-mail é inadequado ou spam, pode registrar uma reclamação com {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    documentSigned: {
      subject: 'Documento "{{document_title}}" foi assinado por {{signer_name}}',
      header: 'Documento assinado por {{signer_name}}',
      greeting: 'Prezado(a) {{creator_name}},',
      body: '{{document_title}} foi assinado por {{signer_name}} "{{signer_email}}" com sucesso',
      viewDocument: 'Ver Documento',
      footer:
        'Este é um e-mail automático do {{app_name}}. Para quaisquer dúvidas sobre este e-mail, entre em contato diretamente com o remetente {{creator_email}}. Se você acha que este e-mail é inadequado ou spam, pode registrar uma reclamação com {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    documentCompleted: {
      subject: 'Documento "{{document_title}}" foi assinado por todas as partes',
      header: 'Documento assinado com sucesso',
      body: 'Todas as partes assinaram com sucesso o documento <b>"{{document_title}}"</b>. Por favor, baixe o documento do anexo.',
      completionTitle: 'Processo concluído!',
      completionSubtitle: 'Todas as assinaturas foram coletadas',
      attachmentInfo:
        '<strong>📎 Documento anexado:</strong> O documento assinado por todas as partes está anexado a este e-mail. Baixe o arquivo para seus registros.',
      footer:
        'Este é um e-mail automático do {{app_name}}. Para quaisquer dúvidas sobre este e-mail, entre em contato diretamente com o remetente {{sender_email}}. Se você acha que este e-mail é inadequado ou spam, pode registrar uma reclamação com {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    resetPassword: {
      subject: 'Redefina sua senha para {{app_name}}',
      greeting: 'Olá!',
      body: 'Você solicitou a redefinição de senha da sua conta:',
      instruction: 'Clique no botão abaixo para redefinir sua senha:',
      ctaText: 'Verificar e-mail',
      footer: 'Se você não solicitou esta redefinição de senha, ignore este e-mail.',
    },
    emailVerification: {
      subject: 'Verifique seu e-mail para {{app_name}}',
      greeting: 'Olá!',
      body: 'Por favor, verifique seu endereço de e-mail para:',
      instruction: 'Clique no botão abaixo para verificar seu e-mail:',
      ctaText: 'Verificar e-mail',
      footer: 'Se você não criou uma conta, ignore este e-mail.',
    },
    otpVerification: {
      subject: 'Seu OTP do {{app_name}}',
      header: 'Verificação OTP',
      body: 'Seu OTP para verificação do {{app_name}} é:',
      footer: 'Este código expirará em 10 minutos. Não compartilhe este código com ninguém.',
    },
    accountDeletion: {
      subject: 'Solicitação de Exclusão de Conta para {{username}} – {{app_name}}',
      greeting: 'Olá Administrador,',
      body: 'Um usuário solicitou a exclusão da conta:',
      userLabel: 'Usuário',
      instruction: 'Clique no botão abaixo para processar esta solicitação:',
      ctaText: 'Processar Exclusão',
      footer: 'Esta é uma notificação automática do {{app_name}}.',
    },
    forwardDocument: {
      subject: '{{sender_name}} assinou o doc - {{document_title}}',
      header: 'Cópia do Documento',
      greeting: 'Olá,',
      body: '{{sender_name}} compartilhou um documento assinado com você.',
      documentLabel: 'Documento Assinado',
      attachmentInfo:
        '<strong>📎 Documento anexado:</strong> O documento assinado está anexado a este e-mail. Baixe o arquivo para seus registros.',
      footer:
        'Este é um e-mail automático do {{app_name}}. Para quaisquer dúvidas sobre este e-mail, entre em contato diretamente com o remetente {{sender_email}}. Se você acha que este e-mail é inadequado ou spam, pode registrar uma reclamação com {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    deletionOtp: {
      subject: 'OTP de Exclusão de Conta - {{app_name}}',
      header: 'Verificação de Exclusão de Conta',
      greeting: 'Olá {{username}},',
      body: 'Você solicitou excluir sua conta. Seu código de verificação é:',
      footer:
        'Este código expirará em 10 minutos. Se você não solicitou isso, proteja sua conta imediatamente.',
    },
    // Certificado de Conclusão
    certificate: {
      generatedOn: 'Gerado em',
      title: 'Certificado de Conclusão',
      summary: 'Resumo',
      documentId: 'ID do Documento :',
      documentName: 'Assunto :',
      organization: 'Organização :',
      createdOn: 'Criado em :',
      completedOn: 'Concluído em :',
      signers: 'Signatários :',
      documentHash: 'Hash SHA-256 do Documento :',
      documentOriginator: 'Remetente do envelope',
      envelopeSender: 'Remetente do envelope',
      status: 'Status',
      sent: 'Enviado',
      name: 'Nome :',
      email: 'E-mail :',
      ipAddress: 'Endereço IP :',
      plant: 'Planta :',
      legalName: 'Razão Social :',
      cnpj: 'CNPJ :',
      address: 'Endereço :',
      contactEmail: 'E-mail de Contato :',
      contactPhone: 'Telefone de Contato :',
      signer: 'Signatário',
      securityLevel: 'Nível de segurança :',
      emailOtpAuth: 'E-mail, Autenticação OTP',
      viewedOn: 'Visualizado em :',
      signedOn: 'Assinado em :',
      signature: 'Assinatura :',
      signerEvents: 'Eventos do signatário',
      signatureColumn: 'Assinatura',
      timestampColumn: 'Registro de hora e data',
    },
  },
  it: {
    // Email di benvenuto per nuovo utente
    welcomeUser: {
      subject: 'Benvenuto! Il tuo account è stato creato',
      title: 'Benvenuto su {{app_name}}!',
      message:
        'Il tuo account è stato creato con successo. Di seguito le tue credenziali di accesso:',
      emailLabel: 'Email',
      passwordLabel: 'Password Temporanea',
      securityWarning:
        'Per motivi di sicurezza, ti consigliamo di cambiare la password dopo il primo accesso.',
      loginButton: 'Accedi alla piattaforma',
      additionalInfo:
        'Se hai domande o hai bisogno di aiuto, contatta il tuo amministratore o il nostro team di supporto.',
      footerText: 'Si prega di non rispondere a questa email. Questo è un messaggio automatico.',
      autoEmailText: 'Questa email è stata inviata automaticamente dal sistema.',
    },
    // E-mail di invito alla firma
    inviteToSign: {
      subject: '{{sender_name}} ti ha chiesto di firmare "{{document_title}}"',
      header: 'Richiesta di Firma Digitale',
      intro:
        '{{sender_name}} ti ha chiesto di rivedere e firmare <strong>{{document_title}}</strong>.',
      senderLabel: 'Mittente',
      organizationLabel: 'Organizzazione',
      expiresLabel: 'Scade il',
      noteLabel: 'Nota',
      ctaText: 'Firma qui',
      footer:
        'Questa è un\'email automatica di {{app_name}}. Per qualsiasi domanda riguardante questa email, contatta direttamente il mittente {{sender_email}}. Se ritieni che questa email sia inappropriata o spam, puoi presentare un reclamo a {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    // Notifica documento firmato (al creatore)
    documentSigned: {
      subject: 'Il documento "{{document_title}}" è stato firmato da {{signer_name}}',
      header: 'Documento firmato da {{signer_name}}',
      greeting: 'Gentile {{creator_name}},',
      body: '{{document_title}} è stato firmato con successo da {{signer_name}} "{{signer_email}}"',
      viewDocument: 'Visualizza Documento',
      footer:
        'Questa è un\'email automatica di {{app_name}}. Per qualsiasi domanda riguardante questa email, contatta direttamente il mittente {{creator_email}}. Se ritieni che questa email sia inappropriata o spam, puoi presentare un reclamo a {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    // Documento completato (tutte le parti hanno firmato)
    documentCompleted: {
      subject: 'Il documento "{{document_title}}" è stato firmato da tutte le parti',
      header: 'Documento firmato con successo',
      body: 'Tutte le parti hanno firmato con successo il documento <b>"{{document_title}}"</b>. Si prega di scaricare il documento dall\'allegato.',
      completionTitle: 'Processo completato!',
      completionSubtitle: 'Tutte le firme sono state raccolte',
      attachmentInfo:
        '<strong>📎 Documento allegato:</strong> Il documento firmato da tutte le parti è allegato a questa email. Scarica il file per i tuoi archivi.',
      footer:
        'Questa è un\'email automatica di {{app_name}}. Per qualsiasi domanda riguardante questa email, contatta direttamente il mittente {{sender_email}}. Se ritieni che questa email sia inappropriata o spam, puoi presentare un reclamo a {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    // Reimpostazione password
    resetPassword: {
      subject: 'Reimposta la tua password per {{app_name}}',
      greeting: 'Ciao!',
      body: 'Hai richiesto di reimpostare la password del tuo account:',
      instruction: 'Clicca sul pulsante qui sotto per reimpostare la tua password:',
      ctaText: 'Verifica email',
      footer: 'Se non hai richiesto questa reimpostazione della password, ignora questa email.',
    },
    // Verifica email
    emailVerification: {
      subject: 'Verifica la tua email per {{app_name}}',
      greeting: 'Ciao!',
      body: 'Verifica il tuo indirizzo email per:',
      instruction: 'Clicca sul pulsante qui sotto per verificare la tua email:',
      ctaText: 'Verifica email',
      footer: 'Se non hai creato un account, ignora questa email.',
    },
    // Email di verifica OTP
    otpVerification: {
      subject: 'Il tuo OTP {{app_name}}',
      header: 'Verifica OTP',
      body: 'Il tuo OTP per la verifica di {{app_name}} è:',
      footer: 'Questo codice scadrà tra 10 minuti. Non condividere questo codice con nessuno.',
    },
    // Richiesta di cancellazione account
    accountDeletion: {
      subject: 'Richiesta di Cancellazione Account per {{username}} – {{app_name}}',
      greeting: 'Ciao Amministratore,',
      body: "Un utente ha richiesto la cancellazione dell'account:",
      userLabel: 'Utente',
      instruction: 'Clicca sul pulsante qui sotto per elaborare questa richiesta:',
      ctaText: 'Elabora Cancellazione',
      footer: 'Questa è una notifica automatica da {{app_name}}.',
    },
    // Inoltro documento
    forwardDocument: {
      subject: '{{sender_name}} ha firmato il doc - {{document_title}}',
      header: 'Copia del Documento',
      greeting: 'Ciao,',
      body: '{{sender_name}} ha condiviso un documento firmato con te.',
      documentLabel: 'Documento Firmato',
      attachmentInfo:
        '<strong>📎 Documento allegato:</strong> Il documento firmato è allegato a questa email. Scarica il file per i tuoi archivi.',
      footer:
        'Questa è un\'email automatica di {{app_name}}. Per qualsiasi domanda riguardante questa email, contatta direttamente il mittente {{sender_email}}. Se ritieni che questa email sia inappropriata o spam, puoi presentare un reclamo a {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    // OTP cancellazione account
    deletionOtp: {
      subject: 'OTP Cancellazione Account - {{app_name}}',
      header: 'Verifica Cancellazione Account',
      greeting: 'Ciao {{username}},',
      body: 'Hai richiesto di eliminare il tuo account. Il tuo codice di verifica è:',
      footer:
        'Questo codice scadrà tra 10 minuti. Se non hai richiesto questa operazione, proteggi immediatamente il tuo account.',
    },
    // Certificato di Completamento
    certificate: {
      generatedOn: 'Generato il',
      title: 'Certificato di Completamento',
      summary: 'Riepilogo',
      documentId: 'ID Documento :',
      documentName: 'Nome Documento :',
      organization: 'Organizzazione :',
      createdOn: 'Creato il :',
      completedOn: 'Completato il :',
      signers: 'Firmatari :',
      documentHash: 'Hash SHA-256 del Documento :',
      documentOriginator: 'Creatore del documento',
      name: 'Nome :',
      email: 'Email :',
      ipAddress: 'Indirizzo IP :',
      signer: 'Firmatario',
      securityLevel: 'Livello di sicurezza :',
      emailOtpAuth: 'Email, Autenticazione OTP',
      viewedOn: 'Visualizzato il :',
      signedOn: 'Firmato il :',
      signature: 'Firma :',
    },
  },
  es: {
    // Correo de bienvenida para nuevo usuario
    welcomeUser: {
      subject: '¡Bienvenido! Su cuenta ha sido creada',
      title: '¡Bienvenido a {{app_name}}!',
      message:
        'Su cuenta ha sido creada exitosamente. A continuación están sus credenciales de acceso:',
      emailLabel: 'Correo electrónico',
      passwordLabel: 'Contraseña temporal',
      securityWarning:
        'Por razones de seguridad, le recomendamos cambiar su contraseña después del primer inicio de sesión.',
      loginButton: 'Acceder a la Plataforma',
      additionalInfo:
        'Si tiene alguna pregunta o necesita ayuda, comuníquese con su administrador o con nuestro equipo de soporte.',
      footerText:
        'Por favor, no responda a este correo electrónico. Este es un mensaje automatizado.',
      autoEmailText: 'Este correo electrónico fue enviado automáticamente por el sistema.',
    },
    // Correo de invitación para firmar
    inviteToSign: {
      subject: '{{sender_name}} ha solicitado tu firma en "{{document_title}}"',
      header: 'Solicitud de Firma Digital',
      intro:
        '{{sender_name}} te ha solicitado revisar y firmar <strong>{{document_title}}</strong>.',
      senderLabel: 'Remitente',
      organizationLabel: 'Organización',
      expiresLabel: 'Expira el',
      noteLabel: 'Nota',
      ctaText: 'Firmar aquí',
      footer:
        'Este es un correo automático de {{app_name}}. Para cualquier consulta sobre este correo, contacta directamente al remitente {{sender_email}}. Si crees que este correo es inapropiado o spam, puedes presentar una queja en {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    // Notificación de documento firmado (al creador)
    documentSigned: {
      subject: 'El documento "{{document_title}}" ha sido firmado por {{signer_name}}',
      header: 'Documento firmado por {{signer_name}}',
      greeting: 'Estimado/a {{creator_name}},',
      body: '{{document_title}} ha sido firmado exitosamente por {{signer_name}} "{{signer_email}}"',
      viewDocument: 'Ver Documento',
      footer:
        'Este es un correo automático de {{app_name}}. Para cualquier consulta sobre este correo, contacta directamente al remitente {{creator_email}}. Si crees que este correo es inapropiado o spam, puedes presentar una queja en {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    // Documento completado (todas las partes firmaron)
    documentCompleted: {
      subject: 'El documento "{{document_title}}" ha sido firmado por todas las partes',
      header: 'Documento firmado exitosamente',
      body: 'Todas las partes han firmado exitosamente el documento <b>"{{document_title}}"</b>. Por favor, descarga el documento del archivo adjunto.',
      completionTitle: '¡Proceso completado!',
      completionSubtitle: 'Se han recolectado todas las firmas',
      attachmentInfo:
        '<strong>📎 Documento adjunto:</strong> El documento firmado por todas las partes está adjunto a este correo. Descarga el archivo para tus registros.',
      footer:
        'Este es un correo automático de {{app_name}}. Para cualquier consulta sobre este correo, contacta directamente al remitente {{sender_email}}. Si crees que este correo es inapropiado o spam, puedes presentar una queja en {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    // Restablecimiento de contraseña
    resetPassword: {
      subject: 'Restablece tu contraseña para {{app_name}}',
      greeting: '¡Hola!',
      body: 'Has solicitado restablecer la contraseña de tu cuenta:',
      instruction: 'Haz clic en el botón de abajo para restablecer tu contraseña:',
      ctaText: 'Verificar correo',
      footer:
        'Si no solicitaste este restablecimiento de contraseña, ignora este correo electrónico.',
    },
    // Verificación de correo
    emailVerification: {
      subject: 'Verifica tu correo para {{app_name}}',
      greeting: '¡Hola!',
      body: 'Por favor, verifica tu dirección de correo electrónico para:',
      instruction: 'Haz clic en el botón de abajo para verificar tu correo:',
      ctaText: 'Verificar correo',
      footer: 'Si no creaste una cuenta, ignora este correo electrónico.',
    },
    // Correo de verificación OTP
    otpVerification: {
      subject: 'Tu OTP de {{app_name}}',
      header: 'Verificación OTP',
      body: 'Tu OTP para la verificación de {{app_name}} es:',
      footer: 'Este código expirará en 10 minutos. No compartas este código con nadie.',
    },
    // Solicitud de eliminación de cuenta
    accountDeletion: {
      subject: 'Solicitud de Eliminación de Cuenta para {{username}} – {{app_name}}',
      greeting: 'Hola Administrador,',
      body: 'Un usuario ha solicitado la eliminación de su cuenta:',
      userLabel: 'Usuario',
      instruction: 'Haz clic en el botón de abajo para procesar esta solicitud:',
      ctaText: 'Procesar Eliminación',
      footer: 'Esta es una notificación automática de {{app_name}}.',
    },
    // Reenvío de documento
    forwardDocument: {
      subject: '{{sender_name}} ha firmado el doc - {{document_title}}',
      header: 'Copia del Documento',
      greeting: 'Hola,',
      body: '{{sender_name}} ha compartido un documento firmado contigo.',
      documentLabel: 'Documento Firmado',
      attachmentInfo:
        '<strong>📎 Documento adjunto:</strong> El documento firmado está adjunto a este correo. Descarga el archivo para tus registros.',
      footer:
        'Este es un correo automático de {{app_name}}. Para cualquier consulta sobre este correo, contacta directamente al remitente {{sender_email}}. Si crees que este correo es inapropiado o spam, puedes presentar una queja en {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    // OTP de eliminación de cuenta
    deletionOtp: {
      subject: 'OTP de Eliminación de Cuenta - {{app_name}}',
      header: 'Verificación de Eliminación de Cuenta',
      greeting: 'Hola {{username}},',
      body: 'Has solicitado eliminar tu cuenta. Tu código de verificación es:',
      footer:
        'Este código expirará en 10 minutos. Si no solicitaste esto, asegura tu cuenta de inmediato.',
    },
    // Certificado de Finalización
    certificate: {
      generatedOn: 'Generado el',
      title: 'Certificado de Finalización',
      summary: 'Resumen',
      documentId: 'ID de Documento :',
      documentName: 'Nombre del Documento :',
      organization: 'Organización :',
      createdOn: 'Creado el :',
      completedOn: 'Completado el :',
      signers: 'Firmantes :',
      documentHash: 'Hash SHA-256 del Documento :',
      documentOriginator: 'Creador del documento',
      name: 'Nombre :',
      email: 'Correo :',
      ipAddress: 'Dirección IP :',
      signer: 'Firmante',
      securityLevel: 'Nivel de seguridad :',
      emailOtpAuth: 'Correo, Autenticación OTP',
      viewedOn: 'Visto el :',
      signedOn: 'Firmado el :',
      signature: 'Firma :',
    },
  },
  fr: {
    // E-mail de bienvenue pour nouvel utilisateur
    welcomeUser: {
      subject: 'Bienvenue ! Votre compte a été créé',
      title: 'Bienvenue sur {{app_name}} !',
      message: 'Votre compte a été créé avec succès. Voici vos identifiants de connexion :',
      emailLabel: 'E-mail',
      passwordLabel: 'Mot de passe temporaire',
      securityWarning:
        'Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe après votre première connexion.',
      loginButton: 'Accéder à la plateforme',
      additionalInfo:
        "Si vous avez des questions ou besoin d'aide, veuillez contacter votre administrateur ou notre équipe de support.",
      footerText: 'Veuillez ne pas répondre à cet e-mail. Ceci est un message automatisé.',
      autoEmailText: 'Cet e-mail a été envoyé automatiquement par le système.',
    },
    // E-mail d'invitation à la signature
    inviteToSign: {
      subject: '{{sender_name}} vous a demandé de signer "{{document_title}}"',
      header: 'Demande de Signature Numérique',
      intro:
        '{{sender_name}} vous a demandé de réviser et signer <strong>{{document_title}}</strong>.',
      senderLabel: 'Expéditeur',
      organizationLabel: 'Organisation',
      expiresLabel: 'Expire le',
      noteLabel: 'Note',
      ctaText: 'Signer ici',
      footer:
        'Ceci est un e-mail automatique de {{app_name}}. Pour toute question concernant cet e-mail, veuillez contacter directement l\'expéditeur {{sender_email}}. Si vous pensez que cet e-mail est inapproprié ou un spam, vous pouvez déposer une plainte auprès de {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    // Notification de document signé (au créateur)
    documentSigned: {
      subject: 'Le document "{{document_title}}" a été signé par {{signer_name}}',
      header: 'Document signé par {{signer_name}}',
      greeting: 'Cher/Chère {{creator_name}},',
      body: '{{document_title}} a été signé avec succès par {{signer_name}} "{{signer_email}}"',
      viewDocument: 'Voir le Document',
      footer:
        'Ceci est un e-mail automatique de {{app_name}}. Pour toute question concernant cet e-mail, veuillez contacter directement l\'expéditeur {{creator_email}}. Si vous pensez que cet e-mail est inapproprié ou un spam, vous pouvez déposer une plainte auprès de {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    // Document terminé (toutes les parties ont signé)
    documentCompleted: {
      subject: 'Le document "{{document_title}}" a été signé par toutes les parties',
      header: 'Document signé avec succès',
      body: 'Toutes les parties ont signé avec succès le document <b>"{{document_title}}"</b>. Veuillez télécharger le document depuis la pièce jointe.',
      completionTitle: 'Processus terminé !',
      completionSubtitle: 'Toutes les signatures ont été collectées',
      attachmentInfo:
        '<strong>📎 Document joint :</strong> Le document signé par toutes les parties est joint à cet e-mail. Téléchargez le fichier pour vos dossiers.',
      footer:
        'Ceci est un e-mail automatique de {{app_name}}. Pour toute question concernant cet e-mail, veuillez contacter directement l\'expéditeur {{sender_email}}. Si vous pensez que cet e-mail est inapproprié ou un spam, vous pouvez déposer une plainte auprès de {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    // Réinitialisation du mot de passe
    resetPassword: {
      subject: 'Réinitialisez votre mot de passe pour {{app_name}}',
      greeting: 'Bonjour !',
      body: 'Vous avez demandé à réinitialiser le mot de passe de votre compte :',
      instruction: 'Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :',
      ctaText: "Vérifier l'e-mail",
      footer:
        "Si vous n'avez pas demandé cette réinitialisation du mot de passe, veuillez ignorer cet e-mail.",
    },
    // Vérification de l'e-mail
    emailVerification: {
      subject: 'Vérifiez votre e-mail pour {{app_name}}',
      greeting: 'Bonjour !',
      body: 'Veuillez vérifier votre adresse e-mail pour :',
      instruction: 'Cliquez sur le bouton ci-dessous pour vérifier votre e-mail :',
      ctaText: "Vérifier l'e-mail",
      footer: "Si vous n'avez pas créé de compte, veuillez ignorer cet e-mail.",
    },
    // E-mail de vérification OTP
    otpVerification: {
      subject: 'Votre OTP {{app_name}}',
      header: 'Vérification OTP',
      body: 'Votre OTP pour la vérification de {{app_name}} est :',
      footer: 'Ce code expirera dans 10 minutes. Ne partagez ce code avec personne.',
    },
    // Demande de suppression de compte
    accountDeletion: {
      subject: 'Demande de Suppression de Compte pour {{username}} – {{app_name}}',
      greeting: 'Bonjour Administrateur,',
      body: 'Un utilisateur a demandé la suppression de son compte :',
      userLabel: 'Utilisateur',
      instruction: 'Cliquez sur le bouton ci-dessous pour traiter cette demande :',
      ctaText: 'Traiter la Suppression',
      footer: 'Ceci est une notification automatique de {{app_name}}.',
    },
    // Transfert de document
    forwardDocument: {
      subject: '{{sender_name}} a signé le doc - {{document_title}}',
      header: 'Copie du Document',
      greeting: 'Bonjour,',
      body: '{{sender_name}} a partagé un document signé avec vous.',
      documentLabel: 'Document Signé',
      attachmentInfo:
        '<strong>📎 Document joint :</strong> Le document signé est joint à cet e-mail. Téléchargez le fichier pour vos dossiers.',
      footer:
        'Ceci est un e-mail automatique de {{app_name}}. Pour toute question concernant cet e-mail, veuillez contacter directement l\'expéditeur {{sender_email}}. Si vous pensez que cet e-mail est inapproprié ou un spam, vous pouvez déposer une plainte auprès de {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a>.',
    },
    // OTP de suppression de compte
    deletionOtp: {
      subject: 'OTP de Suppression de Compte - {{app_name}}',
      header: 'Vérification de Suppression de Compte',
      greeting: 'Bonjour {{username}},',
      body: 'Vous avez demandé à supprimer votre compte. Votre code de vérification est :',
      footer:
        "Ce code expirera dans 10 minutes. Si vous n'avez pas demandé cela, sécurisez immédiatement votre compte.",
    },
    // Certificat de Finalisation
    certificate: {
      generatedOn: 'Généré le',
      title: 'Certificat de Finalisation',
      summary: 'Résumé',
      documentId: 'ID du Document :',
      documentName: 'Nom du Document :',
      organization: 'Organisation :',
      createdOn: 'Créé le :',
      completedOn: 'Terminé le :',
      signers: 'Signataires :',
      documentHash: 'Hash SHA-256 du Document :',
      documentOriginator: 'Créateur du document',
      name: 'Nom :',
      email: 'E-mail :',
      ipAddress: 'Adresse IP :',
      signer: 'Signataire',
      securityLevel: 'Niveau de sécurité :',
      emailOtpAuth: 'E-mail, Authentification OTP',
      viewedOn: 'Consulté le :',
      signedOn: 'Signé le :',
      signature: 'Signature :',
    },
  },
  de: {
    // Willkommens-E-Mail für neuen Benutzer
    welcomeUser: {
      subject: 'Willkommen! Ihr Konto wurde erstellt',
      title: 'Willkommen bei {{app_name}}!',
      message: 'Ihr Konto wurde erfolgreich erstellt. Hier sind Ihre Anmeldedaten:',
      emailLabel: 'E-Mail',
      passwordLabel: 'Temporäres Passwort',
      securityWarning:
        'Aus Sicherheitsgründen empfehlen wir Ihnen, Ihr Passwort nach der ersten Anmeldung zu ändern.',
      loginButton: 'Zur Plattform',
      additionalInfo:
        'Wenn Sie Fragen haben oder Hilfe benötigen, wenden Sie sich bitte an Ihren Administrator oder unser Support-Team.',
      footerText:
        'Bitte antworten Sie nicht auf diese E-Mail. Dies ist eine automatisierte Nachricht.',
      autoEmailText: 'Diese E-Mail wurde automatisch vom System gesendet.',
    },
    // E-Mail zur Signatureinladung
    inviteToSign: {
      subject: '{{sender_name}} hat Sie gebeten, "{{document_title}}" zu unterschreiben',
      header: 'Anfrage für Digitale Signatur',
      intro:
        '{{sender_name}} hat Sie gebeten, <strong>{{document_title}}</strong> zu prüfen und zu unterschreiben.',
      senderLabel: 'Absender',
      organizationLabel: 'Organisation',
      expiresLabel: 'Läuft ab am',
      noteLabel: 'Hinweis',
      ctaText: 'Hier unterschreiben',
      footer:
        'Dies ist eine automatische E-Mail von {{app_name}}. Bei Fragen zu dieser E-Mail wenden Sie sich bitte direkt an den Absender {{sender_email}}. Wenn Sie diese E-Mail für unangemessen oder Spam halten, können Sie eine Beschwerde bei {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a> einreichen.',
    },
    // Benachrichtigung über signiertes Dokument (an den Ersteller)
    documentSigned: {
      subject: 'Das Dokument "{{document_title}}" wurde von {{signer_name}} signiert',
      header: 'Dokument signiert von {{signer_name}}',
      greeting: 'Sehr geehrte/r {{creator_name}},',
      body: '{{document_title}} wurde erfolgreich von {{signer_name}} "{{signer_email}}" signiert',
      viewDocument: 'Dokument anzeigen',
      footer:
        'Dies ist eine automatische E-Mail von {{app_name}}. Bei Fragen zu dieser E-Mail wenden Sie sich bitte direkt an den Absender {{creator_email}}. Wenn Sie diese E-Mail für unangemessen oder Spam halten, können Sie eine Beschwerde bei {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a> einreichen.',
    },
    // Dokument abgeschlossen (alle Parteien haben signiert)
    documentCompleted: {
      subject: 'Das Dokument "{{document_title}}" wurde von allen Parteien unterschrieben',
      header: 'Dokument erfolgreich signiert',
      body: 'Alle Parteien haben das Dokument <b>"{{document_title}}"</b> erfolgreich signiert. Bitte laden Sie das Dokument aus dem Anhang herunter.',
      completionTitle: 'Vorgang abgeschlossen!',
      completionSubtitle: 'Alle Unterschriften wurden gesammelt',
      attachmentInfo:
        '<strong>📎 Angehängtes Dokument:</strong> Das von allen Parteien unterzeichnete Dokument ist dieser E-Mail beigefügt. Laden Sie die Datei für Ihre Unterlagen herunter.',
      footer:
        'Dies ist eine automatische E-Mail von {{app_name}}. Bei Fragen zu dieser E-Mail wenden Sie sich bitte direkt an den Absender {{sender_email}}. Wenn Sie diese E-Mail für unangemessen oder Spam halten, können Sie eine Beschwerde bei {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a> einreichen.',
    },
    // Passwort zurücksetzen
    resetPassword: {
      subject: 'Setzen Sie Ihr Passwort für {{app_name}} zurück',
      greeting: 'Hallo!',
      body: 'Sie haben das Zurücksetzen des Passworts für Ihr Konto angefordert:',
      instruction: 'Klicken Sie auf die Schaltfläche unten, um Ihr Passwort zurückzusetzen:',
      ctaText: 'E-Mail verifizieren',
      footer:
        'Wenn Sie dieses Zurücksetzen des Passworts nicht angefordert haben, ignorieren Sie bitte diese E-Mail.',
    },
    // E-Mail-Verifizierung
    emailVerification: {
      subject: 'Verifizieren Sie Ihre E-Mail für {{app_name}}',
      greeting: 'Hallo!',
      body: 'Bitte verifizieren Sie Ihre E-Mail-Adresse für:',
      instruction: 'Klicken Sie auf die Schaltfläche unten, um Ihre E-Mail zu verifizieren:',
      ctaText: 'E-Mail verifizieren',
      footer: 'Wenn Sie kein Konto erstellt haben, ignorieren Sie bitte diese E-Mail.',
    },
    // OTP-Verifizierungs-E-Mail
    otpVerification: {
      subject: 'Ihr {{app_name}} OTP',
      header: 'OTP-Verifizierung',
      body: 'Ihr OTP für die {{app_name}}-Verifizierung lautet:',
      footer: 'Dieser Code läuft in 10 Minuten ab. Teilen Sie diesen Code mit niemandem.',
    },
    // Anfrage zur Kontolöschung
    accountDeletion: {
      subject: 'Anfrage zur Kontolöschung für {{username}} – {{app_name}}',
      greeting: 'Hallo Administrator,',
      body: 'Ein Benutzer hat die Löschung seines Kontos beantragt:',
      userLabel: 'Benutzer',
      instruction: 'Klicken Sie auf die Schaltfläche unten, um diese Anfrage zu bearbeiten:',
      ctaText: 'Löschung bearbeiten',
      footer: 'Dies ist eine automatische Benachrichtigung von {{app_name}}.',
    },
    // Dokumentweiterleitung
    forwardDocument: {
      subject: '{{sender_name}} hat das Dokument signiert - {{document_title}}',
      header: 'Dokumentkopie',
      greeting: 'Hallo,',
      body: '{{sender_name}} hat ein signiertes Dokument mit Ihnen geteilt.',
      documentLabel: 'Signiertes Dokument',
      attachmentInfo:
        '<strong>📎 Angehängtes Dokument:</strong> Das signierte Dokument ist dieser E-Mail beigefügt. Laden Sie die Datei für Ihre Unterlagen herunter.',
      footer:
        'Dies ist eine automatische E-Mail von {{app_name}}. Bei Fragen zu dieser E-Mail wenden Sie sich bitte direkt an den Absender {{sender_email}}. Wenn Sie diese E-Mail für unangemessen oder Spam halten, können Sie eine Beschwerde bei {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a> einreichen.',
    },
    // OTP zur Kontolöschung
    deletionOtp: {
      subject: 'Kontolöschungs-OTP - {{app_name}}',
      header: 'Verifizierung der Kontolöschung',
      greeting: 'Hallo {{username}},',
      body: 'Sie haben die Löschung Ihres Kontos beantragt. Ihr Verifizierungscode lautet:',
      footer:
        'Dieser Code läuft in 10 Minuten ab. Wenn Sie dies nicht angefordert haben, sichern Sie sofort Ihr Konto.',
    },
    // Abschlusszertifikat
    certificate: {
      generatedOn: 'Erstellt am',
      title: 'Abschlusszertifikat',
      summary: 'Zusammenfassung',
      documentId: 'Dokument-ID :',
      documentName: 'Dokumentname :',
      organization: 'Organisation :',
      createdOn: 'Erstellt am :',
      completedOn: 'Abgeschlossen am :',
      signers: 'Unterzeichner :',
      documentHash: 'SHA-256-Hash des Dokuments :',
      documentOriginator: 'Dokumentersteller',
      name: 'Name :',
      email: 'E-Mail :',
      ipAddress: 'IP-Adresse :',
      signer: 'Unterzeichner',
      securityLevel: 'Sicherheitsstufe :',
      emailOtpAuth: 'E-Mail, OTP-Authentifizierung',
      viewedOn: 'Angesehen am :',
      signedOn: 'Unterschrieben am :',
      signature: 'Unterschrift :',
    },
  },
  hi: {
    // नए उपयोगकर्ता के लिए स्वागत ईमेल
    welcomeUser: {
      subject: 'स्वागत है! आपका खाता बनाया गया है',
      title: '{{app_name}} में आपका स्वागत है!',
      message: 'आपका खाता सफलतापूर्वक बनाया गया है। यहाँ आपकी लॉगिन जानकारी है:',
      emailLabel: 'ईमेल',
      passwordLabel: 'अस्थायी पासवर्ड',
      securityWarning:
        'सुरक्षा कारणों से, हम अनुशंसा करते हैं कि आप अपनी पहली लॉगिन के बाद अपना पासवर्ड बदलें।',
      loginButton: 'प्लेटफॉर्म एक्सेस करें',
      additionalInfo:
        'यदि आपके कोई प्रश्न हैं या मदद की आवश्यकता है, तो कृपया अपने व्यवस्थापक या हमारी सहायता टीम से संपर्क करें।',
      footerText: 'कृपया इस ईमेल का जवाब न दें। यह एक स्वचालित संदेश है।',
      autoEmailText: 'यह ईमेल सिस्टम द्वारा स्वचालित रूप से भेजा गया था।',
    },
    // हस्ताक्षर आमंत्रण ईमेल
    inviteToSign: {
      subject: '{{sender_name}} ने आपसे "{{document_title}}" पर हस्ताक्षर करने का अनुरोध किया है',
      header: 'डिजिटल हस्ताक्षर अनुरोध',
      intro:
        '{{sender_name}} ने आपसे <strong>{{document_title}}</strong> की समीक्षा करने और हस्ताक्षर करने का अनुरोध किया है।',
      senderLabel: 'प्रेषक',
      organizationLabel: 'संगठन',
      expiresLabel: 'समाप्ति तिथि',
      noteLabel: 'टिप्पणी',
      ctaText: 'यहां हस्ताक्षर करें',
      footer:
        'यह {{app_name}} से एक स्वचालित ईमेल है। इस ईमेल के बारे में किसी भी प्रश्न के लिए, कृपया सीधे प्रेषक {{sender_email}} से संपर्क करें। यदि आपको लगता है कि यह ईमेल अनुचित या स्पैम है, तो आप {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a> शिकायत दर्ज कर सकते हैं।',
    },
    // दस्तावेज़ हस्ताक्षरित सूचना (निर्माता को)
    documentSigned: {
      subject: 'दस्तावेज़ "{{document_title}}" को {{signer_name}} द्वारा हस्ताक्षरित किया गया है',
      header: '{{signer_name}} द्वारा दस्तावेज़ हस्ताक्षरित',
      greeting: 'प्रिय {{creator_name}},',
      body: '{{document_title}} को {{signer_name}} "{{signer_email}}" द्वारा सफलतापूर्वक हस्ताक्षरित किया गया है',
      viewDocument: 'दस्तावेज़ देखें',
      footer:
        'यह {{app_name}} से एक स्वचालित ईमेल है। इस ईमेल के बारे में किसी भी प्रश्न के लिए, कृपया सीधे प्रेषक {{creator_email}} से संपर्क करें। यदि आपको लगता है कि यह ईमेल अनुचित या स्पैम है, तो आप {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a> शिकायत दर्ज कर सकते हैं।',
    },
    // दस्तावेज़ पूर्ण (सभी पक्षों ने हस्ताक्षर किए)
    documentCompleted: {
      subject: 'दस्तावेज़ "{{document_title}}" सभी पक्षों द्वारा हस्ताक्षरित किया गया है',
      header: 'दस्तावेज़ सफलतापूर्वक हस्ताक्षरित',
      body: 'सभी पक्षों ने दस्तावेज़ <b>"{{document_title}}"</b> पर सफलतापूर्वक हस्ताक्षर किए हैं। कृपया संलग्नक से दस्तावेज़ डाउनलोड करें।',
      completionTitle: 'प्रक्रिया पूर्ण!',
      completionSubtitle: 'सभी हस्ताक्षर एकत्र किए गए हैं',
      attachmentInfo:
        '<strong>📎 संलग्न दस्तावेज़:</strong> सभी पक्षों द्वारा हस्ताक्षरित दस्तावेज़ इस ईमेल के साथ संलग्न है। अपने रिकॉर्ड के लिए फ़ाइल डाउनलोड करें।',
      footer:
        'यह {{app_name}} से एक स्वचालित ईमेल है। इस ईमेल के बारे में किसी भी प्रश्न के लिए, कृपया सीधे प्रेषक {{sender_email}} से संपर्क करें। यदि आपको लगता है कि यह ईमेल अनुचित या स्पैम है, तो आप {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a> शिकायत दर्ज कर सकते हैं।',
    },
    // पासवर्ड रीसेट
    resetPassword: {
      subject: '{{app_name}} के लिए अपना पासवर्ड रीसेट करें',
      greeting: 'नमस्ते!',
      body: 'आपने अपने खाते के लिए पासवर्ड रीसेट करने का अनुरोध किया है:',
      instruction: 'अपना पासवर्ड रीसेट करने के लिए नीचे दिए गए बटन पर क्लिक करें:',
      ctaText: 'ईमेल सत्यापित करें',
      footer: 'यदि आपने इस पासवर्ड रीसेट का अनुरोध नहीं किया है, तो कृपया इस ईमेल को अनदेखा करें।',
    },
    // ईमेल सत्यापन
    emailVerification: {
      subject: '{{app_name}} के लिए अपना ईमेल सत्यापित करें',
      greeting: 'नमस्ते!',
      body: 'कृपया अपने ईमेल पते को सत्यापित करें:',
      instruction: 'अपना ईमेल सत्यापित करने के लिए नीचे दिए गए बटन पर क्लिक करें:',
      ctaText: 'ईमेल सत्यापित करें',
      footer: 'यदि आपने कोई खाता नहीं बनाया है, तो कृपया इस ईमेल को अनदेखा करें।',
    },
    // OTP सत्यापन ईमेल
    otpVerification: {
      subject: 'आपका {{app_name}} OTP',
      header: 'OTP सत्यापन',
      body: '{{app_name}} सत्यापन के लिए आपका OTP है:',
      footer: 'यह कोड 10 मिनट में समाप्त हो जाएगा। इस कोड को किसी के साथ साझा न करें।',
    },
    // खाता हटाने का अनुरोध
    accountDeletion: {
      subject: '{{username}} के लिए खाता हटाने का अनुरोध – {{app_name}}',
      greeting: 'नमस्ते प्रशासक,',
      body: 'एक उपयोगकर्ता ने खाता हटाने का अनुरोध किया है:',
      userLabel: 'उपयोगकर्ता',
      instruction: 'इस अनुरोध को संसाधित करने के लिए नीचे दिए गए बटन पर क्लिक करें:',
      ctaText: 'हटाने की प्रक्रिया करें',
      footer: 'यह {{app_name}} से एक स्वचालित अधिसूचना है।',
    },
    // दस्तावेज़ अग्रेषण
    forwardDocument: {
      subject: '{{sender_name}} ने दस्तावेज़ पर हस्ताक्षर किए - {{document_title}}',
      header: 'दस्तावेज़ प्रति',
      greeting: 'नमस्ते,',
      body: '{{sender_name}} ने आपके साथ एक हस्ताक्षरित दस्तावेज़ साझा किया है।',
      documentLabel: 'हस्ताक्षरित दस्तावेज़',
      attachmentInfo:
        '<strong>📎 संलग्न दस्तावेज़:</strong> हस्ताक्षरित दस्तावेज़ इस ईमेल के साथ संलग्न है। अपने रिकॉर्ड के लिए फ़ाइल डाउनलोड करें।',
      footer:
        'यह {{app_name}} से एक स्वचालित ईमेल है। इस ईमेल के बारे में किसी भी प्रश्न के लिए, कृपया सीधे प्रेषक {{sender_email}} से संपर्क करें। यदि आपको लगता है कि यह ईमेल अनुचित या स्पैम है, तो आप {{app_name}} <a href="mailto:supportbr@opensignbr.com">supportbr@opensignbr.com</a> शिकायत दर्ज कर सकते हैं।',
    },
    // खाता हटाने का OTP
    deletionOtp: {
      subject: 'खाता हटाने का OTP - {{app_name}}',
      header: 'खाता हटाने का सत्यापन',
      greeting: 'नमस्ते {{username}},',
      body: 'आपने अपना खाता हटाने का अनुरोध किया है। आपका सत्यापन कोड है:',
      footer:
        'यह कोड 10 मिनट में समाप्त हो जाएगा। यदि आपने इसका अनुरोध नहीं किया है, तो तुरंत अपने खाते को सुरक्षित करें।',
    },
    // समापन प्रमाणपत्र
    certificate: {
      generatedOn: 'उत्पन्न तिथि',
      title: 'समापन प्रमाणपत्र',
      summary: 'सारांश',
      documentId: 'दस्तावेज़ आईडी :',
      documentName: 'दस्तावेज़ का नाम :',
      organization: 'संगठन :',
      createdOn: 'निर्माण तिथि :',
      completedOn: 'समापन तिथि :',
      signers: 'हस्ताक्षरकर्ता :',
      documentHash: 'दस्तावेज़ SHA-256 हैश :',
      documentOriginator: 'दस्तावेज़ निर्माता',
      name: 'नाम :',
      email: 'ईमेल :',
      ipAddress: 'आईपी पता :',
      signer: 'हस्ताक्षरकर्ता',
      securityLevel: 'सुरक्षा स्तर :',
      emailOtpAuth: 'ईमेल, OTP प्रमाणीकरण',
      viewedOn: 'देखने की तिथि :',
      signedOn: 'हस्ताक्षर तिथि :',
      signature: 'हस्ताक्षर :',
    },
  },
};

/**
 * Get email locale texts for a specific language
 * @param {string} lang - Language code (en, pt, pt-BR, it, es, fr, de, hi)
 * @returns {object} Email texts for the specified language, fallback to English if not found
 */
export function getEmailLocale(lang = 'en') {
  // Normalize language code
  const normalizedLang = lang?.toLowerCase().trim();

  // Try exact match first
  if (emailLocales[normalizedLang]) {
    return emailLocales[normalizedLang];
  }

  // Try base language (e.g., 'pt' from 'pt-BR')
  const baseLang = normalizedLang?.split('-')[0];
  if (baseLang && emailLocales[baseLang]) {
    return emailLocales[baseLang];
  }

  // Fallback to English
  return emailLocales.en;
}

/**
 * Get user's preferred language from contracts_Users
 * @param {string} userId - User ID (contracts_Users objectId or _User objectId)
 * @returns {Promise<string>} User's language preference or 'en' as default
 */
export async function getUserLanguage(userId) {
  if (!userId) {
    return 'en';
  }

  try {
    // Try to find in contracts_Users first
    const userQuery = new Parse.Query('contracts_Users');
    userQuery.equalTo('objectId', userId);
    const user = await userQuery.first({ useMasterKey: true });

    if (user && user.get('language')) {
      return user.get('language');
    }

    // Fallback: try _User if contracts_Users doesn't have language
    const parseUserQuery = new Parse.Query('_User');
    parseUserQuery.equalTo('objectId', userId);
    const parseUser = await parseUserQuery.first({ useMasterKey: true });

    if (parseUser) {
      // Check if there's a related contracts_Users
      const relatedUserQuery = new Parse.Query('contracts_Users');
      relatedUserQuery.equalTo('UserId', parseUser.toPointer());
      const relatedUser = await relatedUserQuery.first({ useMasterKey: true });

      if (relatedUser && relatedUser.get('language')) {
        return relatedUser.get('language');
      }
    }

    // Default fallback
    return 'en';
  } catch (err) {
    console.log('Error fetching user language:', err.message);
    return 'en';
  }
}

/**
 * Get user's preferred language by email (for non-registered signers)
 * @param {string} email - User email address
 * @returns {Promise<string>} User's language preference or 'en' as default
 */
export async function getUserLanguageByEmail(email) {
  if (!email) {
    return 'en';
  }

  try {
    // Try to find in contracts_Users by email
    const userQuery = new Parse.Query('contracts_Users');
    userQuery.equalTo('Email', email);
    const user = await userQuery.first({ useMasterKey: true });

    if (user && user.get('language')) {
      return user.get('language');
    }

    // Fallback: try _User
    const parseUserQuery = new Parse.Query('_User');
    parseUserQuery.equalTo('email', email);
    const parseUser = await parseUserQuery.first({ useMasterKey: true });

    if (parseUser) {
      // Check if there's a related contracts_Users
      const relatedUserQuery = new Parse.Query('contracts_Users');
      relatedUserQuery.equalTo('UserId', parseUser.toPointer());
      const relatedUser = await relatedUserQuery.first({ useMasterKey: true });

      if (relatedUser && relatedUser.get('language')) {
        return relatedUser.get('language');
      }
    }

    // Default fallback
    return 'en';
  } catch (err) {
    console.log('Error fetching user language by email:', err.message);
    return 'en';
  }
}

export default {
  emailLocales,
  getEmailLocale,
  getUserLanguage,
  getUserLanguageByEmail,
};
