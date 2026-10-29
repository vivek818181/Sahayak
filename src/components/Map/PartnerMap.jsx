// components/Map/PartnerMap.jsx — Interactive OpenStreetMap Geo-Spatial Partner Locator
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Locate, Navigation, Layers, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { PARTNER_TYPE_LABELS } from '../../data/partners';
import './PartnerMap.css';

// Custom Pin generator for Leaflet
function createCustomPin(type, label = '') {
  let color = '#0d9488'; // SCA default
  let letter = 'S';
  if (type === 'PSB') {
    color = '#3b6ba5';
    letter = 'B';
  } else if (type === 'RRB') {
    color = '#f59e0b';
    letter = 'R';
  } else if (type === 'MFI') {
    color = '#10b981';
    letter = 'M';
  }

  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: `
      <div class="pin-icon-wrapper" style="background: ${color};">
        <span class="pin-icon-inner">${letter}</span>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });
}

const userLocationPin = L.divIcon({
  className: 'custom-leaflet-pin',
  html: '<div class="pin-user-location" title="Your Location"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

export default function PartnerMap({
  partners = [],
  selectedPartner = null,
  onSelectPartner,
  userLocation = null,
  onLocateUser,
  locating = false,
  centerCoordinates = { lat: 20.5937, lng: 78.9629, zoom: 5 }, // Default center: India
}) {
  const { t, language } = useLanguage();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const [mapError, setMapError] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [centerCoordinates.lat, centerCoordinates.lng],
          zoom: centerCoordinates.zoom || 5,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        // OpenStreetMap free tile layer
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
      }
    } catch (err) {
      console.error('Failed to initialize Leaflet map', err);
      setMapError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Center map when centerCoordinates change (e.g. State or District selected)
  useEffect(() => {
    if (mapInstanceRef.current && centerCoordinates && centerCoordinates.lat) {
      mapInstanceRef.current.setView(
        [centerCoordinates.lat, centerCoordinates.lng],
        centerCoordinates.zoom || 10,
        { animate: true }
      );
    }
  }, [centerCoordinates?.lat, centerCoordinates?.lng, centerCoordinates?.zoom]);

  // Update Partner Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    partners.forEach((partner) => {
      if (!partner.lat || !partner.lng) return;

      const marker = L.marker([partner.lat, partner.lng], {
        icon: createCustomPin(partner.type),
      });

      const typeMeta = PARTNER_TYPE_LABELS[partner.type] || { en: partner.type };
      const localizedType = typeMeta[language] || typeMeta.en || partner.type;
      const partnerName = (language === 'hi' && partner.nameHi) ? partner.nameHi : (language === 'mr' && partner.nameMr) ? partner.nameMr : partner.name;
      const distanceLabel = t('map.distance') || 'Distance';
      const awayLabel = t('map.away') || 'away';
      const addressLabel = t('map.address') || 'Address';
      const selectBtnLabel = t('map.selectPartner') || 'Select This Partner';

      const distanceText = partner.distanceKm ? `<strong>${distanceLabel}:</strong> ~${partner.distanceKm} km ${awayLabel}<br/>` : '';

      const popupHtml = document.createElement('div');
      popupHtml.className = 'map-popup-card';
      popupHtml.innerHTML = `
        <span class="badge badge-teal" style="font-size: 10px; width: fit-content;">
          ${localizedType}
        </span>
        <div class="map-popup-title">${partnerName}</div>
        <div class="map-popup-meta">
          ${distanceText}
          <strong>${addressLabel}:</strong> ${partner.address}
        </div>
        <div class="map-popup-actions">
          <button id="popup-select-${partner.id}" class="btn btn-primary" style="padding: 6px 12px; font-size: 11px;">
            ${selectBtnLabel}
          </button>
        </div>
      `;

      // Attach button listener inside popup
      popupHtml.querySelector(`#popup-select-${partner.id}`)?.addEventListener('click', () => {
        onSelectPartner(partner);
      });

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        onSelectPartner(partner);
      });

      markersLayerRef.current.addLayer(marker);
    });
  }, [partners, onSelectPartner, language, t]);

  // Update User Location Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (userLocation && userLocation.lat && userLocation.lng) {
      const locTitle = t('map.userLocationTitle') || 'Your Current Location';
      const locDesc = t('map.userLocationDesc') || 'Used for distance ranking';
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: userLocationPin,
        })
          .bindPopup(`<strong>${locTitle}</strong><br/>(${locDesc})`)
          .addTo(mapInstanceRef.current);
      } else {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
        userMarkerRef.current.setPopupContent(`<strong>${locTitle}</strong><br/>(${locDesc})`);
      }

      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 12, { duration: 1.5 });
    }
  }, [userLocation, language, t]);

  // Fly to selected partner
  useEffect(() => {
    if (mapInstanceRef.current && selectedPartner && selectedPartner.lat && selectedPartner.lng) {
      mapInstanceRef.current.flyTo([selectedPartner.lat, selectedPartner.lng], 14, {
        duration: 1.2,
      });
    }
  }, [selectedPartner]);

  if (mapError) {
    return (
      <div className="partner-map-wrapper empty-state" style={{ height: '350px' }}>
        <AlertCircle size={40} color="#f59e0b" />
        <h3>{t('map.offlineTitle')}</h3>
        <p>{t('map.offlineDesc')}</p>
      </div>
    );
  }

  return (
    <div className="partner-map-wrapper animate-fade-in">
      <div ref={mapContainerRef} className="partner-map-container" />

      {/* Floating Geolocation & Layer Controls */}
      <div className="map-overlay-controls">
        <button
          className="map-control-btn"
          onClick={onLocateUser}
          disabled={locating}
          title={t('map.detectLocation')}
        >
          <Locate size={15} color="var(--color-teal-700)" />
          <span>{locating ? t('map.detecting') : t('map.nearMe')}</span>
        </button>
      </div>

      {/* 3D Map Legend */}
      <div className="map-legend">
        <div>
          <span className="legend-dot" style={{ background: '#0d9488' }} />
          <span>SCA</span>
        </div>
        <div>
          <span className="legend-dot" style={{ background: '#3b6ba5' }} />
          <span>PSB</span>
        </div>
        <div>
          <span className="legend-dot" style={{ background: '#f59e0b' }} />
          <span>RRB</span>
        </div>
        <div>
          <span className="legend-dot" style={{ background: '#10b981' }} />
          <span>MFI</span>
        </div>
      </div>
    </div>
  );
}
