
const config = {
  service_id: 'service_jq1iouj',
  public_key: 'WIpC2OpUrjJmjTM0N',
  template_client: 'template_f3vpif6',
  template_admin: 'template_96y4d1o'
};

async function testNotification(templateId, label) {
  console.log(`\n--- Test de notification : ${label} ---`);
  
  const payload = {
    service_id: config.service_id,
    template_id: templateId,
    user_id: config.public_key,
    template_params: {
        order_id: "SIM-8888",
        user_name: "Client Test Rioo",
        user_email: "riooshoop@gmail.com",
        total_amount: "12 500 FCFA",
        delivery_address: "Zone 4, Abidjan (Test simulation)",
        items_summary: "Paire de Basket (x1), Parfum You (x1)",
        payment_method: "Paiement à la livraison (TEST SIMULATION)",
        reply_to: "contact@tfexpress.com"
    }
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log(`✅ Succès pour ${label} !`);
    } else {
      const errorText = await response.text();
      console.error(`❌ Échec pour ${label} :`, errorText);
    }
  } catch (error) {
    console.error(`❌ Erreur réseau pour ${label} :`, error);
  }
}

async function runTests() {
  console.log("🚀 Lancement de la simulation d'envoi d'emails...");
  
  // Test Client
  await testNotification(config.template_client, "Email Client (Confirmation)");
  
  // Test Admin
  await testNotification(config.template_admin, "Email Admin (Nouvelle commande)");
  
  console.log("\n--- Fin des tests ---");
}

runTests();
