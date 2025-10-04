export function generateCertificate(data) {
  const {
    studentName,
    courseName,
    completionDate,
    certificateId,
    instructorName,
    instructorSignature,
    organizationLogo,
  } = data;

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 900;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#007bff';
  ctx.lineWidth = 20;
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

  ctx.strokeStyle = '#e9ecef';
  ctx.lineWidth = 5;
  ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

  ctx.fillStyle = '#007bff';
  ctx.font = 'bold 60px serif';
  ctx.textAlign = 'center';
  ctx.fillText('CERTIFICATE', canvas.width / 2, 150);

  ctx.fillStyle = '#6c757d';
  ctx.font = '24px sans-serif';
  ctx.fillText('OF COMPLETION', canvas.width / 2, 190);

  ctx.fillStyle = '#333333';
  ctx.font = '20px sans-serif';
  ctx.fillText('This is to certify that', canvas.width / 2, 280);

  ctx.fillStyle = '#007bff';
  ctx.font = 'bold 48px serif';
  ctx.fillText(studentName, canvas.width / 2, 350);

  ctx.strokeStyle = '#007bff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 250, 370);
  ctx.lineTo(canvas.width / 2 + 250, 370);
  ctx.stroke();

  ctx.fillStyle = '#333333';
  ctx.font = '20px sans-serif';
  ctx.fillText('has successfully completed the course', canvas.width / 2, 430);

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText(courseName, canvas.width / 2, 480);

  ctx.fillStyle = '#6c757d';
  ctx.font = '18px sans-serif';
  ctx.fillText(
    `Completed on ${new Date(completionDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`,
    canvas.width / 2,
    540
  );

  if (instructorName) {
    ctx.fillStyle = '#000000';
    ctx.font = 'italic 20px serif';
    ctx.textAlign = 'left';
    ctx.fillText(instructorName, 200, 700);

    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(150, 680);
    ctx.lineTo(400, 680);
    ctx.stroke();

    ctx.fillStyle = '#6c757d';
    ctx.font = '14px sans-serif';
    ctx.fillText('Instructor', 150, 720);
  }

  ctx.textAlign = 'right';
  ctx.fillStyle = '#000000';
  ctx.font = 'italic 20px serif';
  ctx.fillText('Elevate for Humanity', canvas.width - 200, 700);

  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(canvas.width - 400, 680);
  ctx.lineTo(canvas.width - 150, 680);
  ctx.stroke();

  ctx.fillStyle = '#6c757d';
  ctx.font = '14px sans-serif';
  ctx.fillText('Organization', canvas.width - 150, 720);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#999999';
  ctx.font = '12px monospace';
  ctx.fillText(`Certificate ID: ${certificateId}`, canvas.width / 2, 820);

  const decorativeSize = 80;
  ctx.fillStyle = '#007bff';
  ctx.globalAlpha = 0.1;
  
  for (let i = 0; i < 4; i++) {
    const x = i < 2 ? 100 : canvas.width - 100;
    const y = i % 2 === 0 ? 100 : canvas.height - 100;
    
    ctx.beginPath();
    ctx.arc(x, y, decorativeSize, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.globalAlpha = 1.0;

  return canvas.toDataURL('image/png');
}

export function downloadCertificate(dataUrl, filename = 'certificate.png') {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateCertificateId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `CERT-${timestamp}-${random}`.toUpperCase();
}

export async function verifyCertificate(certificateId) {
  try {
    const response = await fetch(`/api/certificates/verify/${certificateId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Certificate verification failed:', error);
    return { valid: false, error: error.message };
  }
}

export function shareCertificate(certificateData) {
  const { studentName, courseName, certificateUrl } = certificateData;
  
  const shareData = {
    title: `${studentName} - ${courseName} Certificate`,
    text: `I've completed ${courseName} and earned my certificate!`,
    url: certificateUrl,
  };

  if (navigator.share) {
    return navigator.share(shareData);
  } else {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(certificateUrl)}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(certificateUrl)}`;
    
    return {
      linkedin: linkedInUrl,
      twitter: twitterUrl,
      facebook: facebookUrl,
    };
  }
}
