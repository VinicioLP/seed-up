import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { useAuth } from '@/components/auth-context';
import { CameraCaptureModal } from '@/components/camera-capture-modal';
import { apiFetch } from '@/lib/api';
import { sendCommunityPostPublishedNotificationAsync } from '@/lib/notifications';

type CommunityPost = {
  id: string;
  author: string;
  authorAvatarUrl?: string;
  content: string;
  imageUrls: string[];
  createdAt: string;
};

export default function Community() {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ postId?: string }>();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isComposerVisible, setIsComposerVisible] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [postText, setPostText] = useState('');
  const [photoUris, setPhotoUris] = useState<string[]>([]);

  function getPostAvatarUrl(post: CommunityPost) {
    if (post.author === user?.nickname && user?.profilePhotoUri) {
      return user.profilePhotoUri;
    }

    return post.authorAvatarUrl;
  }

  useEffect(() => {
    let isMounted = true;

    async function loadPosts() {
      try {
        const response = await apiFetch('/api/community/posts');

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { posts?: CommunityPost[] };

        if (isMounted) {
          setPosts(data.posts ?? []);
        }
      } catch {
        // Keep the community usable even if the API is temporarily unavailable.
      }
    }

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!params.postId || !posts.length) {
      return;
    }

    const notifiedPost = posts.find((post) => post.id === params.postId);

    if (notifiedPost) {
      setSelectedPost(notifiedPost);
    }
  }, [params.postId, posts]);

  const emptyMessage = useMemo(
    () => (posts.length ? '' : 'Nenhuma postagem ainda. Compartilhe a primeira ideia do seu jardim.'),
    [posts.length]
  );

  async function createPost() {
    const cleanText = postText.trim();

    if (!cleanText) {
      return;
    }

    const formData = new FormData();
    formData.append('content', cleanText);
    photoUris.forEach((photoUri, index) => {
      formData.append('images[]', {
        uri: photoUri,
        name: `photo-${index}.jpg`,
        type: 'image/jpeg',
      } as any);
    });

    try {
      const response = await apiFetch('/api/community/posts', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(errorBody?.message ?? 'Nao foi possivel salvar a postagem.');
      }

      const data = (await response.json()) as { post?: CommunityPost };

      const createdPost =
        data.post ?? {
          id: Date.now().toString(),
          author: user?.nickname ?? 'Cultivador',
          authorAvatarUrl: user?.profilePhotoUri,
          content: cleanText,
          imageUrls: photoUris,
          createdAt: 'Agora',
        };

      setPosts((currentPosts) => [createdPost, ...currentPosts]);

      setPostText('');
      setPhotoUris([]);
      setIsComposerVisible(false);
      await sendCommunityPostPublishedNotificationAsync(createdPost.id);
    } catch (error) {
      Alert.alert(
        'Erro ao publicar',
        error instanceof Error ? error.message : 'Nao foi possivel salvar a postagem.'
      );
    }
  }

  function addPhoto(photoUri: string) {
    setPhotoUris((currentPhotos) => {
      if (currentPhotos.length >= 10) {
        return currentPhotos;
      }

      return [...currentPhotos, photoUri];
    });
  }

  function addManyPhotos(nextPhotoUris: string[]) {
    setPhotoUris((currentPhotos) => [
      ...currentPhotos,
      ...nextPhotoUris.slice(0, Math.max(10 - currentPhotos.length, 0)),
    ]);
  }

  function removePhoto(photoUri: string) {
    setPhotoUris((currentPhotos) => currentPhotos.filter((currentPhoto) => currentPhoto !== photoUri));
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.brandGroup}>
            <Pressable onPress={() => router.push('/profile')}>
              <Image
                source={user?.profilePhotoUri ? { uri: user.profilePhotoUri } : require('@/assets/images/icon.png')}
                style={styles.avatar}
                contentFit="cover"
              />
            </Pressable>
            <Text style={[styles.brand, { color: colors.tint }]}>SeedUp</Text>
          </View>
          <Pressable style={styles.themeButton} onPress={toggleTheme}>
            <Ionicons
              name={isDark ? 'moon-outline' : 'sunny-outline'}
              size={28}
              color={colors.tint}
            />
          </Pressable>
        </View>

        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: colors.text }]}>Comunidade</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Inspire-se com os jardins de outros cultivadores.
          </Text>
        </View>

        <Pressable
          style={[styles.createButton, { backgroundColor: colors.tint }]}
          onPress={() => setIsComposerVisible(true)}>
          <Ionicons name="add-circle-outline" size={21} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Criar Postagem</Text>
        </Pressable>

        {emptyMessage ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surfaceStrong }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.iconBox }]}>
              <Ionicons name="people-outline" size={28} color={colors.tint} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Comunidade pronta</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>{emptyMessage}</Text>
          </View>
        ) : null}

        {posts.map((post) => (
          <Pressable
            key={post.id}
            style={[styles.postCard, { backgroundColor: colors.surfaceStrong }]}
            onPress={() => setSelectedPost(post)}>
            <View style={styles.postHeader}>
              <View style={[styles.postAvatar, { backgroundColor: colors.iconBox }]}>
                {getPostAvatarUrl(post) ? (
                  <Image
                    source={{ uri: getPostAvatarUrl(post) }}
                    style={styles.postAvatarImage}
                    contentFit="cover"
                  />
                ) : (
                  <Ionicons name="leaf-outline" size={17} color={colors.tint} />
                )}
              </View>
              <Text style={[styles.postAuthor, { color: colors.text }]}>{post.author}</Text>
            </View>

            {post.imageUrls.length ? (
              <View style={post.imageUrls.length === 1 ? styles.singlePostImageWrap : styles.postImageGrid}>
                {post.imageUrls.slice(0, 4).map((imageUri, index) => (
                  <View
                    key={`${post.id}-${imageUri}`}
                    style={post.imageUrls.length === 1 ? styles.singlePostImageItem : styles.gridImageItem}>
                    <Image source={{ uri: imageUri }} style={styles.postImage} contentFit="cover" />
                    {index === 3 && post.imageUrls.length > 4 ? (
                      <View style={styles.moreImagesOverlay}>
                        <Text style={styles.moreImagesText}>+{post.imageUrls.length - 4}</Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.surface }]}>
                <Ionicons name="image-outline" size={32} color={colors.subtle} />
              </View>
            )}

            <View style={styles.postFooter}>
              <View style={styles.actionsRow}>
                <Ionicons name="heart-outline" size={20} color={colors.text} />
                <Text style={[styles.actionText, { color: colors.muted }]}>0</Text>
                <Ionicons name="chatbox-outline" size={19} color={colors.text} />
                <Text style={[styles.actionText, { color: colors.muted }]}>0</Text>
                <Text style={[styles.timeText, { color: colors.subtle }]}>{post.createdAt}</Text>
              </View>
              <Text style={[styles.postText, { color: colors.muted }]}>
                <Text style={[styles.postAuthorInline, { color: colors.text }]}>{post.author} </Text>
                {post.content}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <Modal visible={Boolean(selectedPost)} transparent animationType="slide">
        <View style={styles.detailOverlay}>
          <View style={[styles.detailModal, { backgroundColor: colors.surfaceStrong }]}>
            <View style={styles.detailHeader}>
              <View style={styles.postHeaderCompact}>
                <View style={[styles.postAvatar, { backgroundColor: colors.iconBox }]}>
                  {selectedPost && getPostAvatarUrl(selectedPost) ? (
                    <Image
                      source={{ uri: getPostAvatarUrl(selectedPost) }}
                      style={styles.postAvatarImage}
                      contentFit="cover"
                    />
                  ) : (
                    <Ionicons name="leaf-outline" size={17} color={colors.tint} />
                  )}
                </View>
                <Text style={[styles.postAuthor, { color: colors.text }]}>
                  {selectedPost?.author}
                </Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setSelectedPost(null)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContent}>
              {selectedPost?.imageUrls.map((imageUri) => (
                <Image
                  key={`${selectedPost.id}-${imageUri}`}
                  source={{ uri: imageUri }}
                  style={styles.detailImage}
                  contentFit="cover"
                />
              ))}
              <Text style={[styles.detailText, { color: colors.muted }]}>
                <Text style={[styles.postAuthorInline, { color: colors.text }]}>
                  {selectedPost?.author}{' '}
                </Text>
                {selectedPost?.content}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={isComposerVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.composer, { backgroundColor: colors.surfaceStrong }]}>
            <View style={styles.composerHeader}>
              <Text style={[styles.composerTitle, { color: colors.text }]}>Nova postagem</Text>
              <Pressable style={styles.closeButton} onPress={() => setIsComposerVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Mensagem</Text>
            <TextInput
              value={postText}
              onChangeText={setPostText}
              placeholder="Conte algo sobre seu jardim..."
              placeholderTextColor={colors.subtle}
              multiline
              style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text }]}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Imagens opcionais ({photoUris.length}/10)
            </Text>
            <Pressable
              disabled={photoUris.length >= 10}
              style={[
                styles.photoButton,
                { backgroundColor: colors.surface, opacity: photoUris.length >= 10 ? 0.55 : 1 },
              ]}
              onPress={() => setIsCameraVisible(true)}>
              <Ionicons name="camera-outline" size={22} color={colors.tint} />
              <Text style={[styles.photoButtonText, { color: colors.tint }]}>
                {photoUris.length ? 'Anexar mais fotos' : 'Registrar foto'}
              </Text>
            </Pressable>

            {photoUris.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewRail}>
                {photoUris.map((photoUri) => (
                  <View key={photoUri} style={styles.photoPreviewWrap}>
                    <Image source={{ uri: photoUri }} style={styles.photoPreview} contentFit="cover" />
                    <Pressable style={styles.removePhotoButton} onPress={() => removePhoto(photoUri)}>
                      <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            ) : null}

            <Pressable
              style={[styles.publishButton, { backgroundColor: colors.tint, opacity: postText.trim() ? 1 : 0.55 }]}
              onPress={createPost}>
              <Ionicons name="send-outline" size={18} color="#FFFFFF" />
              <Text style={styles.publishButtonText}>Publicar</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <CameraCaptureModal
        visible={isCameraVisible}
        title="Registrar foto"
        gallerySelectionLimit={Math.max(10 - photoUris.length, 1)}
        onClose={() => setIsCameraVisible(false)}
        onCaptured={addPhoto}
        onCapturedMany={addManyPhotos}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 110,
    gap: 20,
  },
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    marginHorizontal: -24,
    paddingHorizontal: 24,
    paddingBottom: 13,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D6EBD5',
  },
  brand: {
    fontSize: 23,
    fontWeight: '900',
  },
  themeButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    gap: 7,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  subtitle: {
    maxWidth: 280,
    fontSize: 15,
    lineHeight: 22,
  },
  createButton: {
    minHeight: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0 10px 16px rgba(7, 131, 59, 0.22)',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  emptyCard: {
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '900',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
  },
  postCard: {
    borderRadius: 14,
    overflow: 'hidden',
    boxShadow: '0 10px 20px rgba(45, 81, 64, 0.12)',
  },
  postHeader: {
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  postAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  postAvatarImage: {
    width: '100%',
    height: '100%',
  },
  postAuthor: {
    fontSize: 13,
    fontWeight: '900',
  },
  singlePostImageWrap: {
    width: '100%',
    height: 310,
  },
  singlePostImageItem: {
    width: '100%',
    height: 310,
  },
  postImageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    padding: 2,
  },
  gridImageItem: {
    width: '49.6%',
    height: 160,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  moreImagesOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  moreImagesText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  detailOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
  },
  detailModal: {
    maxHeight: '88%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 18,
    gap: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postHeaderCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  detailContent: {
    gap: 12,
    paddingBottom: 12,
  },
  detailImage: {
    width: '100%',
    height: 280,
    borderRadius: 16,
  },
  detailText: {
    fontSize: 15,
    lineHeight: 23,
  },
  imagePlaceholder: {
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postFooter: {
    padding: 13,
    gap: 7,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    marginRight: 12,
    fontSize: 11,
  },
  timeText: {
    marginLeft: 'auto',
    fontSize: 11,
  },
  postText: {
    fontSize: 14,
    lineHeight: 21,
  },
  postAuthorInline: {
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
  },
  composer: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 22,
    gap: 12,
  },
  composerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  composerTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  textArea: {
    minHeight: 120,
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  photoButton: {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoButtonText: {
    fontSize: 15,
    fontWeight: '900',
  },
  previewRail: {
    gap: 10,
    paddingRight: 4,
  },
  photoPreviewWrap: {
    width: 118,
    height: 118,
    borderRadius: 18,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  publishButton: {
    minHeight: 52,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
