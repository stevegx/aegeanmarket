export default function MapWidget() {
  return (
    <div className="w-full h-80 rounded-lg overflow-hidden shadow-lg border border-border">
      <iframe
        title="Map showing our location in Mytilene, Lesvos, Greece"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3095.9907178524963!2d26.554828276459574!3d39.10668148432763!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14ba67091cfe1c39%3A0x3b1ebe294479e2c7!2zzqDOuy4gzqPOsc-Az4bOv8-Nz4IsIM6cz4XPhM65zrvOrs69zrcgODExIDAw!5e0!3m2!1sel!2sgr!4v1776446526282!5m2!1sel!2sgr"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  )
}
