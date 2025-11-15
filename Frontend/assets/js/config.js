export const API_URL = "https://api-nodepost-production.up.railway.app/";

import { API_URL } from '../config/config.js';

fetch(`${API_URL}/usuarios`)
  .then(res => res.json())
  .then(data => console.log(data));
