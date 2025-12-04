import { useLocal } from '../../Utils.js';
import getPresignedUrl, { presignedlocalUrl } from './getSignedUrl.js';

async function PlantAfterFind(request) {
  if (useLocal !== 'true') {
    // Using S3/DigitalOcean Spaces
    if (request.objects && request.objects.length > 0) {
      for (const obj of request.objects) {
        const logoUrl = obj?.get('logoUrl');
        if (logoUrl) {
          obj.set('logoUrl', getPresignedUrl(logoUrl));
        }
      }
      return request.objects;
    }
  } else if (useLocal === 'true') {
    // Using local file storage with JWT
    if (request.objects && request.objects.length > 0) {
      for (const obj of request.objects) {
        const logoUrl = obj?.get('logoUrl');
        if (logoUrl) {
          obj.set('logoUrl', presignedlocalUrl(logoUrl));
        }
      }
      return request.objects;
    }
  }
}

export default PlantAfterFind;
