
// password encrypt
function Encrypt(plainText) {
    var iv = "F27D5C9927726BCEFE7510B1BDD3D137";
    var salt = "3FF2EC019C627B945225DEBAD71A01B6985FE84C95A70EB132882F88C0A59A55";
    var keySize = 128;
    var iterationCount = 10000;
    var passPhrase = "aesalgoisbestbes";
    var aesUtil = new AesUtil(keySize, iterationCount);
    var encrypt = aesUtil.encrypt(salt, iv, passPhrase, plainText);
    
    //	alert(encrypt);
    return encrypt;
}