import * as umbral from "@nucypher/umbral-pre";
import * as fs from "fs";

// As in any public-key cryptosystem, users need a pair of public and private keys.
// Additionally, users that delegate access to their data (like Alice, in this example)
// need a signing keypair.

// Key Generation (on Alice's side)
const alice_sk = umbral.SecretKey.random();
const alice_pk = alice_sk.publicKey();
const signing_sk = umbral.SecretKey.random();
const signer = new umbral.Signer(signing_sk);

// Key Generation (on Bob's side)
const bob_sk = umbral.SecretKey.random();
const bob_pk = bob_sk.publicKey();

// Set threshold for minimum number of Ursulas required to re-encrypt
const threshold = 2;

// Read file and encode to a Uint8Array
const readStream = fs.createReadStream("Input.mp4");
const writeStream = fs.createWriteStream("output.mp4");

let totalBytesRead = 0;
readStream.on("data", chunk => {
  totalBytesRead += chunk.length;

  let shares = 3; // how many fragments to create
  let threshold = 2; // how many should be enough to decrypt
  let kfrags = umbral.generateKFrags(
    alice_sk, bob_pk, signer, threshold, shares,
    true, // add the delegating key (alice_pk) to the signature
    true, // add the receiving key (bob_pk) to the signature
  );

  // Encrypt the chunk using Alice's public key and the kfrags
  const chunkArray = chunk instanceof Buffer ? new Uint8Array(chunk) : new TextEncoder().encode(chunk);
  const [capsule, ciphertext] = umbral.encrypt(alice_pk, chunkArray);

  // Bob asks several Ursulas to re-encrypt the capsule so he can open it.
  // Each Ursula performs re-encryption on the capsule using the kfrag provided by Alice,
  // obtaining this way a "capsule fragment", or cfrag.
  const cfrags = [];
  // Ursula 0
  cfrags.push(umbral.reencrypt(capsule, kfrags[0]));

  // Ursula 1
  cfrags.push(umbral.reencrypt(capsule, kfrags[1]));

  // ...

  // Bob collects the resulting cfrags from several Ursulas.
  // Bob must gather at least `threshold` cfrags in order to open the capsule.
  const collectedCfrags = [cfrags[0], cfrags[1]];

  // Ursulas can optionally check that the received kfrags are valid
  // and perform the reencryption

  // Finally, Bob opens the capsule by using at least `threshold` cfrags,
  // and then decrypts the re-encrypted ciphertext.
  const plaintext_bob = umbral.decryptReencrypted(bob_sk, alice_pk, capsule, collectedCfrags, ciphertext);
  console.log(plaintext_bob)
  writeStream.write(plaintext_bob);
});

readStream.on("end", () => {
  console.log(`File encrypted and decrypted successfully! Total bytes read: ${totalBytesRead}`);
});
